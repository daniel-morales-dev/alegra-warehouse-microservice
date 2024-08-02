import { Service } from "typedi";
import { DataSource, Repository } from "typeorm";
import { ShoppingHistory } from "../models/shoppingHistory.model";

@Service()
export class ShoppingHistoryRepository extends Repository<ShoppingHistory> {
  constructor(dataSource: DataSource) {
    super(ShoppingHistory, dataSource.createEntityManager());
  }

  getHistory() {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );
    return this.createQueryBuilder("h")
      .select([
        "h.id",
        "h.ingredientId",
        "h.createdAt",
        "h.quantity",
        "i.id",
        "i.name",
      ])
      .innerJoin("h.ingredients", "i")
      .where("h.createdAt >= :startOfDay", { startOfDay })
      .andWhere("h.createdAt < :endOfDay", { endOfDay })
      .getMany();
  }
}
