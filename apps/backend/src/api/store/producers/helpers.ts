import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

type QueryGraph = {
  graph: (input: Record<string, unknown>) => Promise<{
    data: Array<Record<string, unknown>>
    metadata?: {
      count?: number
      skip?: number
      take?: number
    }
  }>
}

const getQuery = (scope: { resolve: (key: string) => unknown }) => {
  return scope.resolve(ContainerRegistrationKeys.QUERY) as QueryGraph
}

export const listStoreProducers = async (
  scope: { resolve: (key: string) => unknown },
  filters: {
    q?: string
    limit?: number
    offset?: number
  },
  productFilters: Record<string, unknown>
) => {
  const query = getQuery(scope)
  const response = await query.graph({
    entity: "product",
    fields: [
      "producer.id",
      "producer.name",
      "producer.handle",
      "producer.country",
      "producer.website",
      "producer.description",
      "producer.is_active",
    ],
    filters: productFilters,
  })

  const visibleProducers = new Map<
    string,
    {
      id: string
      name: string
      handle: string
      country: string
      website: string
      description: string | null
      is_active: boolean
    }
  >()

  for (const item of response.data as Array<{
    producer?: {
      id: string
      name: string
      handle: string
      country: string
      website: string
      description?: string | null
      is_active?: boolean
    } | null
  }>) {
    if (!item.producer) {
      continue
    }

    visibleProducers.set(item.producer.id, {
      id: item.producer.id,
      name: item.producer.name,
      handle: item.producer.handle,
      country: item.producer.country,
      website: item.producer.website,
      description: item.producer.description ?? null,
      is_active: item.producer.is_active ?? true,
    })
  }

  const q = filters.q?.trim().toLowerCase()
  const producers = Array.from(visibleProducers.values()).filter((item) => {
    if (!q) {
      return true
    }

    return [item.name, item.country, item.handle].some((value) =>
      value.toLowerCase().includes(q)
    )
  })

  const offset = filters.offset ?? 0
  const limit = filters.limit ?? 12
  const pagedProducers = producers
    .sort((left, right) => left.name.localeCompare(right.name))
    .slice(offset, offset + limit)

  return {
    producers: pagedProducers.map(({ is_active: _ignored, ...producer }) => producer),
    count: producers.length,
    limit,
    offset,
  }
}

export const getStoreProducerByHandle = async (
  scope: { resolve: (key: string) => unknown },
  handle: string,
  pagination: {
    limit?: number
    offset?: number
  },
  productFilters: Record<string, unknown>
) => {
  const query = getQuery(scope)
  const producerResponse = await query.graph({
    entity: "producer",
    fields: [
      "id",
      "name",
      "handle",
      "country",
      "website",
      "description",
      "is_active",
      "products.id",
    ],
    filters: {
      handle,
    },
  })

  const producer = producerResponse.data[0] as
    | {
        id: string
        name: string
        handle: string
        country: string
        website: string
        description?: string | null
        is_active: boolean
        products?: Array<{ id: string }>
      }
    | undefined

  if (!producer) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Producer not found")
  }

  const productIds = producer.products?.map((item) => item.id) ?? []

  if (!productIds.length) {
    return {
      producer: {
        id: producer.id,
        name: producer.name,
        handle: producer.handle,
        country: producer.country,
        website: producer.website,
        description: producer.description ?? null,
        is_active: producer.is_active,
      },
      products: [],
      product_ids: [],
      count: 0,
      limit: pagination.limit ?? 12,
      offset: pagination.offset ?? 0,
    }
  }

  const productResponse = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "status",
      "producer.id",
    ],
    filters: {
      ...productFilters,
      id: productIds,
    },
    pagination: {
      take: pagination.limit ?? 12,
      skip: pagination.offset ?? 0,
    },
  })

  const products = productResponse.data as Array<{
    id: string
    title: string
    handle: string
    thumbnail?: string | null
  }>
  const offset = pagination.offset ?? 0
  const limit = pagination.limit ?? 12
  const totalCount = productResponse.metadata?.count ?? products.length

  return {
    producer: {
      id: producer.id,
      name: producer.name,
      handle: producer.handle,
      country: producer.country,
      website: producer.website,
      description: producer.description ?? null,
      is_active: producer.is_active,
    },
    products: products.map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail ?? null,
    })),
    product_ids: products.map((product) => product.id),
    count: totalCount,
    limit,
    offset,
  }
}

export const getStoreProductProducerByHandle = async (
  scope: { resolve: (key: string) => unknown },
  handle: string,
  productFilters: Record<string, unknown>
) => {
  const query = getQuery(scope)
  const response = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "producer.id",
      "producer.name",
      "producer.handle",
      "producer.country",
      "producer.website",
      "producer.description",
      "producer.is_active",
    ],
    filters: {
      ...productFilters,
      handle,
    },
  })

  const product = response.data[0] as
    | {
        id: string
        handle: string
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
    product: {
      id: product.id,
      handle: product.handle,
    },
    producer: product.producer
      ? {
          id: product.producer.id,
          name: product.producer.name,
          handle: product.producer.handle,
          country: product.producer.country,
          website: product.producer.website,
          description: product.producer.description ?? null,
          is_active: product.producer.is_active ?? true,
        }
      : null,
  }
}
