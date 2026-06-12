import { MiddlewareRoute } from "@medusajs/framework"
import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { z } from "zod"

const optionalString = z
  .string()
  .trim()
  .optional()

export const AdminProducerListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  q: optionalString,
  is_active: z
    .preprocess((value) => {
      if (typeof value === "string") {
        return value === "true"
      }
      return value
    }, z.boolean().optional()),
})

export const AdminCreateProducerSchema = z.object({
  name: z.string().trim().min(1),
  country: z.string().trim().min(1),
  website: z.string().trim().url(),
  description: z.string().trim().optional().nullable(),
  is_active: z.boolean().optional(),
})

export const AdminUpdateProducerSchema = AdminCreateProducerSchema.partial()

export type AdminProducerListQuery = z.infer<typeof AdminProducerListQuerySchema>
export type AdminCreateProducer = z.infer<typeof AdminCreateProducerSchema>
export type AdminUpdateProducer = z.infer<typeof AdminUpdateProducerSchema>

export const adminProducerMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/producers",
    method: "GET",
    middlewares: [validateAndTransformQuery(AdminProducerListQuerySchema, {})],
  },
  {
    matcher: "/admin/producers",
    method: "POST",
    middlewares: [validateAndTransformBody(AdminCreateProducerSchema)],
  },
  {
    matcher: "/admin/producers/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(AdminUpdateProducerSchema)],
  },
  {
    matcher: "/admin/producers/:id",
    method: "DELETE",
    middlewares: [],
  },
  {
    matcher: "/admin/producers/:id",
    method: "GET",
    middlewares: [],
  },
]
