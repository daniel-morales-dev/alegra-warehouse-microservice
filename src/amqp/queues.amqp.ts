import { GetIngredientsWorker } from "../workers/getIngredients.worker";
import { IQueuesToSubscribe } from "../interfaces/queuesToSubscribe.interface";
import { SetIngredientsRecipeWorker } from "../workers/setIngredientsRecipe.worker";

export const QUEUES = {
  REQUEST_FOOD: {
    NAME: "REQUEST_FOOD",
    HANDLER: GetIngredientsWorker,
    PREFETCH: 1,
  },
  SEND_INGREDIENTS: {
    NAME: "SEND_INGREDIENTS",
  },
  SEND_REQUEST_RECIPE_USER: {
    NAME: "SEND_REQUEST_RECIPE_USER",
  },
  REQUEST_INGREDIENTS_FROM_RECIPE: {
    NAME: "REQUEST_INGREDIENTS_FROM_RECIPE",
    HANDLER: SetIngredientsRecipeWorker,
    PREFETCH: 1,
  },
};

export const QUEUES_TO_SUBSCRIBE: IQueuesToSubscribe[] = [
  QUEUES.REQUEST_FOOD,
  QUEUES.REQUEST_INGREDIENTS_FROM_RECIPE,
];
