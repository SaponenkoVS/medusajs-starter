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

export const StoreProducerListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  q: z.string().trim().optional(),
  country_code: z.string().trim().optional(),
})

export const StoreProducerDetailQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  country_code: z.string().trim().optional(),
})

export type StoreProducerListQuery = z.infer<typeof StoreProducerListQuerySchema>
export type StoreProducerDetailQuery = z.infer<typeof StoreProducerDetailQuerySchema>

const storeProductVisibilityMiddlewares = [
  authenticate("customer", ["session", "bearer"], {
    allowUnauthenticated: true,
  }),
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
]

export const storeProducerMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/producers",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(StoreProducerListQuerySchema, {}),
      ...storeProductVisibilityMiddlewares,
    ],
  },
  {
    matcher: "/store/producers/:handle",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(StoreProducerDetailQuerySchema, {}),
      ...storeProductVisibilityMiddlewares,
    ],
  },
]
