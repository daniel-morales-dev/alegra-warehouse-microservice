import { GetIngredientsWorker } from "../workers/getIngredients.worker";
import { IQueuesToSubscribe } from "../interfaces/queuesToSubscribe.interface";

export const QUEUES = {
  REQUEST_FOOD: {
    NAME: "REQUEST_FOOD",
    HANDLER: GetIngredientsWorker,
  },
};

export const QUEUES_TO_SUBSCRIBE: IQueuesToSubscribe[] = [QUEUES.REQUEST_FOOD];
