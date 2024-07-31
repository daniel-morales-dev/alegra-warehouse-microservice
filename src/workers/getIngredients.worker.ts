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

@Service()
export class GetIngredientsWorker implements IWorker {
  private api: ApiCore;
  constructor(private readonly ingredientsRepository: IngredientsRepository) {
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
      console.log("Processing message:", msg);
      const { ingredients: requestIngredients, keyRedis, uuid, recipe } = msg;
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
        await this.ingredientsRepository.save(ingredient);
      }

      await queryRunner.commitTransaction();

      await serverAmqp.sendToQueue(QUEUES.SEND_INGREDIENTS.NAME, {
        uuid,
        keyRedis,
        status: "processing",
        recipe,
      });

      console.log("Message processed successfully", msg.uuid);
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      console.error("ERROR: GetIngredientsWorker.run", exception);
      throw exception;
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
      const { name } = ingredient;
      const response = await this.api.get<IIngredientMarket>("/buy", {
        params: { ingredient: name },
      });

      const { quantitySold } = response.data;

      if (quantitySold > 0) {
        ingredient.quantity += quantitySold;
        ingredient = await this.ingredientsRepository.save(ingredient);

        requiredQuantity -= quantitySold;
      }
    }
    return ingredient;
  }
}
