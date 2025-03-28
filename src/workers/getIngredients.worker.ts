import { Service } from "typedi";
import { IWorker } from "../interfaces/queuesToSubscribe.interface";
import { IRequestIngredients } from "../interfaces/messages/processOrderMessage.interface";
import { IngredientsRepository } from "../repositories/ingredients.repository";
import { ApiCore } from "../core/api.core";
import { MARKET_URL } from "../config/app.config";
import { IIngredientMarket } from "../interfaces/ingredientsMarket.interface";
import { QueryRunner } from "typeorm";
import { AppDataSource } from "../config/DataSource.config";
import { Ingredients } from "../models/ingredients.model";
import serverAmqp from "../amqp/server.amqp";
import { QUEUES } from "../amqp/queues.amqp";
import { ShoppingHistoryRepository } from "../repositories/shoppingHistory.repository";

@Service()
export class GetIngredientsWorker implements IWorker {
  private api: ApiCore;
  constructor(
    private readonly ingredientsRepository: IngredientsRepository,
    private readonly shoppingHistoryRepository: ShoppingHistoryRepository,
  ) {
    this.api = new ApiCore({
      baseURL: MARKET_URL,
    });
  }
  async run(message: string, ack: () => void) {
    const msg: IRequestIngredients = JSON.parse(message);
    const queryRunner: QueryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.ingredientsRepository.manager.transaction(async () => {
        console.info(`[INFO] Receiving order from aliments ${msg.uuid}`);
        const { ingredients: requestIngredients, keyRedis, uuid, recipe } = msg;
        console.log(`[INFO] - WareHouse - RECIPE Requested`, { recipe });
        const ids = requestIngredients.map((i) => i.ingredientId);

        const ingredientsWareHouse =
          await this.ingredientsRepository.getIngredientsFromWareHouse(ids);

        const ingredientsMap = new Map(
          ingredientsWareHouse.map((ing) => [ing.id, ing]),
        );

        for (const reqIngredient of requestIngredients) {
          let ingredient = ingredientsMap.get(reqIngredient.ingredientId);
          if (!ingredient)
            throw new Error(
              `Ingredient with ID ${reqIngredient.ingredientId} not found`,
            );

          const requiredQuantity = reqIngredient.quantity - ingredient.quantity;

          if (requiredQuantity > 0) {
            ingredient = await this.buyAdditionalIngredients(
              ingredient,
              requiredQuantity,
            );
          }

          ingredient.quantity -= reqIngredient.quantity;
          const indexIngredientRecipe = recipe.recipeIngredients.findIndex(
            (ing) => ing.ingredientId === ingredient.id,
          );
          recipe.recipeIngredients[indexIngredientRecipe].name =
            ingredient.name;

          await this.ingredientsRepository.save(ingredient);
        }

        await queryRunner.commitTransaction();

        await serverAmqp.sendToQueue(QUEUES.SEND_INGREDIENTS.NAME, {
          uuid,
          keyRedis,
          recipe,
        });

        console.log(
          `[INFO] Sending ingredients to kitchen - Order ${msg.uuid}`,
        );
      });
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      console.error("ERROR: GetIngredientsWorker.run", exception);
      await serverAmqp.sendToQueue("error_queue", {
        error: exception,
        originalMessage: message,
      });
    } finally {
      await queryRunner.release();
      ack();
    }
  }

  private async buyAdditionalIngredients(
    ingredient: Ingredients,
    requiredQuantity: number,
  ): Promise<Ingredients> {
    while (requiredQuantity > 0) {
      console.info(
        `[INFO] Requesting ingredient ${ingredient.name} - quantity ${requiredQuantity}`,
      );
      const { name } = ingredient;
      const response = await this.api.get<IIngredientMarket>("/buy", {
        params: { ingredient: name },
      });

      const { quantitySold } = response.data;

      if (quantitySold > 0) {
        ingredient.quantity += quantitySold;
        ingredient = await this.ingredientsRepository.save(ingredient);
        const shoppingHistory = this.shoppingHistoryRepository.create({
          ingredientId: ingredient.id,
          quantity: quantitySold,
        });

        await this.shoppingHistoryRepository.save(shoppingHistory);

        console.info("[INFO] Saved shopping history");

        requiredQuantity -= quantitySold;
      }
    }
    return ingredient;
  }
}
