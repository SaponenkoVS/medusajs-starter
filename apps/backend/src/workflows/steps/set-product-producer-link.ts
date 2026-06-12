import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { PRODUCER_MODULE } from "../../modules/producer"
import type ProducerModuleService from "../../modules/producer/service"
import type { ProducerRecord } from "../../modules/producer/types"

type SetProductProducerLinkInput = {
  productId: string
  producerId: string
}

type SetProductProducerLinkCompensation = {
  previousProducerId: string | null
  nextProducerId: string | null
  productId: string
}

type LinkService = {
  create: (input: Record<string, unknown>) => Promise<unknown>
  dismiss: (input: Record<string, unknown>) => Promise<unknown>
}

type QueryGraphResponse = {
  data: Array<{
    id: string
    producer?: {
      id: string
    } | null
  }>
}

export const setProductProducerLinkStep = createStep(
  "set-product-producer-link",
  async (input: SetProductProducerLinkInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
      graph: (input: Record<string, unknown>) => Promise<QueryGraphResponse>
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK) as unknown as LinkService
    const producerService = container.resolve(PRODUCER_MODULE) as ProducerModuleService

    const existingProducer = (await producerService.retrieveProducer(
      input.producerId
    )) as ProducerRecord

    if (!existingProducer.is_active) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Inactive producers cannot be assigned to products"
      )
    }

    const productResult = await query.graph({
      entity: "product",
      fields: ["id", "producer.id"],
      filters: {
        id: input.productId,
      },
    })

    const product = productResult.data[0]

    if (!product) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found")
    }

    const previousProducerId = product.producer ? product.producer.id : null

    if (previousProducerId && previousProducerId !== input.producerId) {
      await link.dismiss({
        [Modules.PRODUCT]: {
          product_id: input.productId,
        },
        [PRODUCER_MODULE]: {
          producer_id: previousProducerId,
        },
      })
    }

    if (previousProducerId !== input.producerId) {
      await link.create({
        [Modules.PRODUCT]: {
          product_id: input.productId,
        },
        [PRODUCER_MODULE]: {
          producer_id: input.producerId,
        },
      })
    }

    return new StepResponse(
      {
        product_id: input.productId,
        producer_id: input.producerId,
      },
      {
        previousProducerId,
        nextProducerId: input.producerId,
        productId: input.productId,
      } satisfies SetProductProducerLinkCompensation
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK) as unknown as LinkService

    if (compensation.nextProducerId) {
      await link.dismiss({
        [Modules.PRODUCT]: {
          product_id: compensation.productId,
        },
        [PRODUCER_MODULE]: {
          producer_id: compensation.nextProducerId,
        },
      })
    }

    if (compensation.previousProducerId) {
      await link.create({
        [Modules.PRODUCT]: {
          product_id: compensation.productId,
        },
        [PRODUCER_MODULE]: {
          producer_id: compensation.previousProducerId,
        },
      })
    }
  }
)
