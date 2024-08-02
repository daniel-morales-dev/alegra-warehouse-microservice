import { Get, JsonController } from "routing-controllers";
import { Service } from "typedi";
import { IngredientsService } from "../services/ingredients.service";

@JsonController("/v1/ingredients")
@Service()
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}
  @Get("/")
  getAllIngredients() {
    return this.ingredientsService.getAllIngredients();
  }
}
