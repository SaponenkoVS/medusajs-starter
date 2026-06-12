import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { PRODUCER_MODULE } from "../../modules/producer"
import type ProducerModuleService from "../../modules/producer/service"
import type { ProducerRecord, UpsertProducerInput } from "../../modules/producer/types"
import {
  buildProducerHandleBase,
  createProducerWritePayload,
  createUniqueProducerHandle,
  ensureUniqueProducerName,
  normalizeProducerName,
  toProducerRecord,
} from "../../modules/producer/utils"

type CreateProducerStepInput = UpsertProducerInput

export const createProducerStep = createStep(
  "create-producer",
  async (input: CreateProducerStepInput, { container }) => {
    const producerService = container.resolve(PRODUCER_MODULE) as ProducerModuleService
    const normalizedName = normalizeProducerName(input.name)
    const isUnique = await ensureUniqueProducerName(producerService, normalizedName)

    if (!isUnique) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A producer with this name already exists"
      )
    }

    const handle = await createUniqueProducerHandle(
      producerService,
      buildProducerHandleBase(input.name)
    )

    const created = await producerService.createProducers(
      createProducerWritePayload(input, handle)
    )

    const producer = toProducerRecord(created as ProducerRecord | ProducerRecord[])

    return new StepResponse(producer, producer.id)
  },
  async (producerId, { container }) => {
    if (!producerId) {
      return
    }

    const producerService = container.resolve(PRODUCER_MODULE) as ProducerModuleService

    await producerService.deleteProducers(producerId)
  }
)
