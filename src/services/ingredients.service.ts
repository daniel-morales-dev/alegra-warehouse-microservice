import { Service } from "typedi";
import { IngredientsRepository } from "../repositories/ingredients.repository";

@Service()
export class IngredientsService {
  constructor(private readonly ingredientsRepository: IngredientsRepository) {}

  async getAllIngredients() {
    return await this.ingredientsRepository.find();
  }
}
