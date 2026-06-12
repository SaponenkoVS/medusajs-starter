import { defineMiddlewares } from "@medusajs/framework/http"

import { adminProductProducerMiddlewares } from "./admin/products/[id]/producer/middlewares"
import { adminProducerMiddlewares } from "./admin/producers/middlewares"
import { storeProductProducerMiddlewares } from "./store/products/[handle]/producer/middlewares"
import { storeProducerMiddlewares } from "./store/producers/middlewares"

export default defineMiddlewares({
  routes: [
    ...adminProducerMiddlewares,
    ...adminProductProducerMiddlewares,
    ...storeProducerMiddlewares,
    ...storeProductProducerMiddlewares,
  ],
})
