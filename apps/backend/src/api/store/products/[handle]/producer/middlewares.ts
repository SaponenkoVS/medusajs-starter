import { MiddlewareRoute } from "@medusajs/framework"
import {
  applyDefaultFilters,
  authenticate,
  clearFiltersByKey,
  maybeApplyLinkFilter,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { ProductStatus } from "@medusajs/framework/utils"
import { filterByValidSalesChannels } from "@medusajs/medusa/api/utils/middlewares/products/index"
import { z } from "zod"

export const StoreProductProducerQuerySchema = z.object({
  country_code: z.string().trim().optional(),
})

export type StoreProductProducerQuery = z.infer<typeof StoreProductProducerQuerySchema>

export const storeProductProducerMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/products/:handle/producer",
    method: "GET",
    middlewares: [
      authenticate("customer", ["session", "bearer"], {
        allowUnauthenticated: true,
      }),
      validateAndTransformQuery(StoreProductProducerQuerySchema, {}),
      filterByValidSalesChannels(),
      maybeApplyLinkFilter({
        entryPoint: "product_sales_channel",
        resourceId: "product_id",
        filterableField: "sales_channel_id",
      }),
      applyDefaultFilters({
        status: ProductStatus.PUBLISHED,
      }),
      clearFiltersByKey(["country_code"]),
    ],
  },
]
