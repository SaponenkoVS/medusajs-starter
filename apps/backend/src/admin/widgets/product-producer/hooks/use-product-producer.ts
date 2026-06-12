import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { producerQueryKeys } from "../../../hooks/use-producers"
import { sdk } from "../../../lib/sdk"

const productProducerResponseSchema = z.object({
  product_id: z.string(),
  producer: z
    .object({
      id: z.string(),
      name: z.string(),
      handle: z.string(),
      country: z.string(),
      website: z.string(),
      description: z.string().nullable().optional(),
      is_active: z.boolean().optional(),
    })
    .nullable(),
})

const producerListResponseSchema = z.object({
  producers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      handle: z.string(),
      country: z.string(),
      website: z.string(),
      description: z.string().nullable(),
      is_active: z.boolean(),
      product_count: z.number(),
    })
  ),
})

export const productProducerQueryKeys = {
  all: ["product-producer"],
  display: (productId) => [
    ...productProducerQueryKeys.all,
    "display",
    productId,
  ],
  options: () => [...productProducerQueryKeys.all, "options"],
}

export const useProductProducer = (productId) => {
  return useQuery({
    queryKey: productProducerQueryKeys.display(productId),
    queryFn: async () => {
      const response = await sdk.client.fetch(
        `/admin/products/${productId}/producer`,
        {
          method: "GET",
        }
      )

      return productProducerResponseSchema.parse(response)
    },
  })
}

export const useAssignableProducerOptions = (enabled) => {
  return useQuery({
    queryKey: productProducerQueryKeys.options(),
    queryFn: async () => {
      const response = await sdk.client.fetch("/admin/producers", {
        method: "GET",
        query: {
          limit: 100,
          offset: 0,
          is_active: true,
        },
      })

      return producerListResponseSchema.parse(response).producers
    },
    enabled,
  })
}

export const useAssignProductProducer = (productId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (producerId) => {
      if (!producerId) {
        const response = await sdk.client.fetch(
          `/admin/products/${productId}/producer`,
          {
            method: "DELETE",
          }
        )

        return productProducerResponseSchema.parse(response)
      }

      const response = await sdk.client.fetch(
        `/admin/products/${productId}/producer`,
        {
          method: "POST",
          body: {
            producer_id: producerId,
          },
        }
      )

      return productProducerResponseSchema.parse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productProducerQueryKeys.display(productId),
      })
      queryClient.invalidateQueries({ queryKey: producerQueryKeys.all })
    },
  })
}
