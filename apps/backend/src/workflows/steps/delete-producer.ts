import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { PRODUCER_MODULE } from "../../modules/producer"
import type ProducerModuleService from "../../modules/producer/service"
import type { ProducerRecord } from "../../modules/producer/types"

type DeleteProducerInput = {
  id: string
  linkedProductCount: number
}

export const deleteProducerStep = createStep(
  "delete-producer",
  async (input: DeleteProducerInput, { container }) => {
    if (input.linkedProductCount > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Producer cannot be deleted while products are still assigned"
      )
    }

    const producerService = container.resolve(PRODUCER_MODULE) as ProducerModuleService
    const existing = (await producerService.retrieveProducer(
      input.id
    )) as ProducerRecord

    await producerService.deleteProducers(input.id)

    return new StepResponse(
      {
        id: input.id,
        deleted: true,
      },
      existing
    )
  },
  async (producer, { container }) => {
    if (!producer) {
      return
    }

    const producerService = container.resolve(PRODUCER_MODULE) as ProducerModuleService

    await producerService.createProducers(producer)
  }
)
