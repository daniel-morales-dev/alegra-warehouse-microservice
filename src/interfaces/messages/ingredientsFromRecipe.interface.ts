import { IIngredientMessage, IRecipe } from "./processOrderMessage.interface";

export interface IIngredientFromRecipe {
  action: string;
  uuid: string;
  status: "pending" | "finished";
  recipes?: IRecipesWithIngredientsNameOptional[];
}

export interface IRecipeIngredientsWithOptionalName extends IIngredientMessage {
  name?: string;
}

export interface IRecipesWithIngredientsNameOptional extends IRecipe {
  recipeIngredients: IRecipeIngredientsWithOptionalName[];
}
