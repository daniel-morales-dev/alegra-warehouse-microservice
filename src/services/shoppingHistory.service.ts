import { Service } from "typedi";
import { ShoppingHistoryRepository } from "../repositories/shoppingHistory.repository";

@Service()
export class ShoppingHistoryService {
  constructor(
    private readonly shoppingHistoryRepository: ShoppingHistoryRepository,
  ) {}

  async getHistory() {
    const history = await this.shoppingHistoryRepository.getHistory();
    return history.map((hi) => ({
      id: hi.id,
      ingredientId: hi.ingredientId,
      ingredientName: hi.ingredients.name,
      quantity: hi.quantity,
      createdAt: hi.createdAt,
    }));
  }
}
