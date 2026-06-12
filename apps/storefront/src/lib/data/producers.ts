"use server"

import { sdk } from "@lib/config"
import { z } from "zod"

import { getAuthHeaders, getCacheOptions } from "./cookies"

const producerSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  country: z.string(),
  website: z.string(),
  description: z.string().nullable().optional(),
})

const producerListResponseSchema = z.object({
  producers: z.array(producerSchema),
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
})

const producerDetailResponseSchema = z.object({
  producer: producerSchema,
  products: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      handle: z.string(),
      thumbnail: z.string().nullable(),
    })
  ),
  product_ids: z.array(z.string()).default([]),
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
})

const productProducerResponseSchema = z.object({
  product: z.object({
    id: z.string(),
    handle: z.string(),
  }),
  producer: producerSchema.nullable(),
})

export type StoreProducer = z.infer<typeof producerSchema>
export type StoreProducerDetailResponse = z.infer<
  typeof producerDetailResponseSchema
>
export type StoreProductProducerResponse = z.infer<
  typeof productProducerResponseSchema
>

export const listProducers = async ({
  countryCode,
  limit = 12,
  offset = 0,
  q,
}: {
  countryCode: string
  limit?: number
  offset?: number
  q?: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("producers")),
  }

  const response = await sdk.client.fetch("/store/producers", {
    method: "GET",
    query: {
      limit,
      offset,
      q,
      country_code: countryCode,
    },
    headers,
    next,
    cache: "force-cache",
  })

  return producerListResponseSchema.parse(response)
}

export const getProducer = async ({
  countryCode,
  handle,
  page = 1,
}: {
  countryCode: string
  handle: string
  page?: number
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions(`producer-${handle}`)),
  }

  const response = await sdk.client.fetch(`/store/producers/${handle}`, {
    method: "GET",
    query: {
      limit: 12,
      offset: Math.max(page - 1, 0) * 12,
      country_code: countryCode,
    },
    headers,
    next,
    cache: "force-cache",
  })

  return producerDetailResponseSchema.parse(response)
}

export const getProductProducer = async ({
  countryCode,
  handle,
}: {
  countryCode: string
  handle: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions(`product-producer-${handle}`)),
  }

  const response = await sdk.client.fetch(`/store/products/${handle}/producer`, {
    method: "GET",
    query: {
      country_code: countryCode,
    },
    headers,
    next,
    cache: "force-cache",
  })

  return productProducerResponseSchema.parse(response)
}
