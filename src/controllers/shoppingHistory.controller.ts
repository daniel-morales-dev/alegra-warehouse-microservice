import { Service } from "typedi";
import { Get, JsonController } from "routing-controllers";
import { ShoppingHistoryService } from "../services/shoppingHistory.service";

@Service()
@JsonController("/v1/shopping-history")
export class ShoppingHistoryController {
  constructor(
    private readonly shoppingHistoryService: ShoppingHistoryService,
  ) {}

  @Get("/")
  getShoppingHistory() {
    return this.shoppingHistoryService.getHistory();
  }
}
