export interface IRequestIngredients {
  ingredients: IIngredientMessage[];
  uuid: string;
  keyRedis: string;
  recipe: IRecipe;
}

export interface IIngredientMessage {
  ingredientId: number;
  quantity: number;
  name?: string;
}
export interface IRecipe {
  id: number;
  name: string;
  recipeIngredients: IIngredientMessage[];
}
