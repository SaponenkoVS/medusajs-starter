import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { PRODUCER_MODULE } from "../../modules/producer"

type RemoveProductProducerLinkInput = {
  productId: string
}

type RemoveProductProducerLinkCompensation = {
  previousProducerId: string | null
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

export const removeProductProducerLinkStep = createStep(
  "remove-product-producer-link",
  async (input: RemoveProductProducerLinkInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
      graph: (input: Record<string, unknown>) => Promise<QueryGraphResponse>
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK) as unknown as LinkService

    const productResult = await query.graph({
      entity: "product",
      fields: ["id", "producer.id"],
      filters: {
        id: input.productId,
      },
    })

    const product = productResult.data[0]
    const previousProducerId = product && product.producer ? product.producer.id : null

    if (previousProducerId) {
      await link.dismiss({
        [Modules.PRODUCT]: {
          product_id: input.productId,
        },
        [PRODUCER_MODULE]: {
          producer_id: previousProducerId,
        },
      })
    }

    return new StepResponse(
      {
        product_id: input.productId,
        producer_id: null,
      },
      {
        previousProducerId,
        productId: input.productId,
      } satisfies RemoveProductProducerLinkCompensation
    )
  },
  async (compensation, { container }) => {
    if (!compensation || !compensation.previousProducerId) {
      return
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK) as unknown as LinkService

    await link.create({
      [Modules.PRODUCT]: {
        product_id: compensation.productId,
      },
      [PRODUCER_MODULE]: {
        producer_id: compensation.previousProducerId,
      },
    })
  }
)
