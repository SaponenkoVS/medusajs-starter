import { MiddlewareRoute } from "@medusajs/framework"
import { validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"

export const AdminAssignProductProducerSchema = z.object({
  producer_id: z.string().trim().min(1).nullable(),
})

export type AdminAssignProductProducer = z.infer<
  typeof AdminAssignProductProducerSchema
>

export const adminProductProducerMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/products/:id/producer",
    method: "GET",
    middlewares: [],
  },
  {
    matcher: "/admin/products/:id/producer",
    method: "POST",
    middlewares: [validateAndTransformBody(AdminAssignProductProducerSchema)],
  },
  {
    matcher: "/admin/products/:id/producer",
    method: "DELETE",
    middlewares: [],
  },
]
