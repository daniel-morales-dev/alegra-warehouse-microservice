import { Service } from "typedi";
import { IWorker } from "../interfaces/queuesToSubscribe.interface";
import { IRequestIngredients } from "../interfaces/messages/processOrderMessage.interface";
import { IIngredientFromRecipe } from "../interfaces/messages/ingredientsFromRecipe.interface";
import serverAmqp from "../amqp/server.amqp";
import { IngredientsRepository } from "../repositories/ingredients.repository";
import { QUEUES } from "../amqp/queues.amqp";

@Service()
export class SetIngredientsRecipeWorker implements IWorker {
  constructor(private readonly ingredientsRepository: IngredientsRepository) {}
  async run(message: string, ack: () => void) {
    const msg: IIngredientFromRecipe = JSON.parse(message);
    try {
      const { recipes } = msg;
      console.log("[INFO] Added ingredients to user recipe request");
      console.log("MESSAGE", msg);
      for (const recipe of recipes!) {
        for (const recipeIngredient of recipe.recipeIngredients) {
          const ingredient = await this.ingredientsRepository.findOne({
            where: { id: recipeIngredient.ingredientId },
          });

          if (ingredient) {
            recipeIngredient.name = ingredient.name;
          }
        }
      }

      msg.status = "finished";

      await serverAmqp.sendToQueue(QUEUES.SEND_REQUEST_RECIPE_USER.NAME, msg);

      console.log(
        "[INFO] Sending recipe with ingredients to user recipe request",
      );
    } catch (err) {
      console.error("ERROR: GetIngredientsWorker.run", err);
      await serverAmqp.sendToQueue("error_queue", {
        error: err,
        originalMessage: message,
      });
    } finally {
      ack();
    }
  }
}
