import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { PRODUCER_MODULE } from "../../../modules/producer"
import type ProducerModuleService from "../../../modules/producer/service"

type QueryGraph = {
  graph: (input: Record<string, unknown>) => Promise<{
    data: Array<Record<string, unknown>>
  }>
}

export type AdminProducerListItem = {
  id: string
  name: string
  handle: string
  country: string
  website: string
  description: string | null
  is_active: boolean
  product_count: number
}

export type AdminProducerDetail = AdminProducerListItem

export type ProductProducerDisplay = {
  product_id: string
  producer: {
    id: string
    name: string
    handle: string
    country: string
    website: string
    description?: string | null
    is_active?: boolean
  } | null
}

const asQuery = (scope: { resolve: (key: string) => unknown }) => {
  return scope.resolve(ContainerRegistrationKeys.QUERY) as QueryGraph
}

const asProducerService = (scope: { resolve: (key: string) => unknown }) => {
  return scope.resolve(PRODUCER_MODULE) as ProducerModuleService
}

export const getProducerList = async (
  scope: { resolve: (key: string) => unknown },
  filters: {
    q?: string
    is_active?: boolean
    limit?: number
    offset?: number
  }
) => {
  const query = asQuery(scope)
  const producerService = asProducerService(scope)
  const serviceFilters: Record<string, unknown> = {}

  if (filters.q) {
    serviceFilters.$or = [
      { name: { $like: `%${filters.q}%` } },
      { country: { $like: `%${filters.q}%` } },
      { handle: { $like: `%${filters.q}%` } },
    ]
  }

  if (typeof filters.is_active === "boolean") {
    serviceFilters.is_active = filters.is_active
  }

  const [items, count] = await producerService.listAndCountProducers(
    serviceFilters,
    {
      take: filters.limit ?? 20,
      skip: filters.offset ?? 0,
      order: { name: "ASC" },
    }
  )

  const ids = items.map((item) => item.id)
  const response = ids.length
    ? await query.graph({
        entity: "producer",
        fields: ["id", "products.id"],
        filters: {
          id: ids,
        },
      })
    : { data: [] }

  const productCounts = new Map(
    (response.data as Array<{
      id: string
      products?: Array<{ id: string }>
    }>).map((item) => [item.id, item.products?.length ?? 0])
  )

  const producers = items as Array<{
    id: string
    name: string
    handle: string
    country: string
    website: string
    description?: string | null
    is_active: boolean
  }>

  return {
    producers: producers.map((item) => ({
      id: item.id,
      name: item.name,
      handle: item.handle,
      country: item.country,
      website: item.website,
      description: item.description ?? null,
      is_active: item.is_active,
      product_count: productCounts.get(item.id) ?? 0,
    })),
    count,
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
  }
}

export const getProducerDetail = async (
  scope: { resolve: (key: string) => unknown },
  id: string
) => {
  const query = asQuery(scope)
  const producerService = asProducerService(scope)
  const producer = (await producerService.retrieveProducer(id)) as {
    id: string
    name: string
    handle: string
    country: string
    website: string
    description?: string | null
    is_active: boolean
  }

  const response = await query.graph({
    entity: "producer",
    fields: ["id", "products.id"],
    filters: {
      id,
    },
  })

  const producerLinkData = response.data[0] as
    | {
        id: string
        products?: Array<{ id: string }>
      }
    | undefined

  return {
    producer: {
      id: producer.id,
      name: producer.name,
      handle: producer.handle,
      country: producer.country,
      website: producer.website,
      description: producer.description ?? null,
      is_active: producer.is_active,
      product_count: producerLinkData?.products?.length ?? 0,
    },
  }
}

export const getAdminProductProducer = async (
  scope: { resolve: (key: string) => unknown },
  productId: string
): Promise<ProductProducerDisplay> => {
  const query = asQuery(scope)
  const response = await query.graph({
    entity: "product",
    fields: [
      "id",
      "producer.id",
      "producer.name",
      "producer.handle",
      "producer.country",
      "producer.website",
      "producer.description",
      "producer.is_active",
    ],
    filters: {
      id: productId,
    },
  })

  const product = response.data[0] as
    | {
        id: string
        producer?: {
          id: string
          name: string
          handle: string
          country: string
          website: string
          description?: string | null
          is_active?: boolean
        } | null
      }
    | undefined

  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found")
  }

  return {
    product_id: product.id,
    producer: product.producer
      ? {
          id: product.producer.id,
          name: product.producer.name,
          handle: product.producer.handle,
          country: product.producer.country,
          website: product.producer.website,
          description: product.producer.description ?? null,
          is_active: product.producer.is_active,
        }
      : null,
  }
}
