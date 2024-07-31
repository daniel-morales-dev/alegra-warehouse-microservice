import { Service } from "typedi";
import { DataSource, Repository } from "typeorm";
import { Ingredients } from "../models/ingredients.model";

@Service()
export class IngredientsRepository extends Repository<Ingredients> {
  constructor(dataSource: DataSource) {
    super(Ingredients, dataSource.createEntityManager());
  }

  getIngredientsFromWareHouse(ingredientIds: number[]) {
    return this.createQueryBuilder("i")
      .where("i.id IN (:...ingredientIds)", {
        ingredientIds: ingredientIds,
      })
      .getMany();
  }
}
