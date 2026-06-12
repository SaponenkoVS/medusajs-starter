import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { PRODUCER_MODULE } from "../../modules/producer"
import type ProducerModuleService from "../../modules/producer/service"
import type { ProducerRecord, UpsertProducerInput } from "../../modules/producer/types"
import {
  createProducerUpdatePayload,
  ensureUniqueProducerName,
  normalizeProducerName,
  toProducerRecord,
} from "../../modules/producer/utils"

type UpdateProducerStepInput = {
  id: string
  data: Partial<UpsertProducerInput>
}

type UpdateProducerCompensation = {
  previous: ProducerRecord
}

export const updateProducerStep = createStep(
  "update-producer",
  async (input: UpdateProducerStepInput, { container }) => {
    const producerService = container.resolve(PRODUCER_MODULE) as ProducerModuleService
    const existing = (await producerService.retrieveProducer(
      input.id
    )) as ProducerRecord

    const nextName =
      typeof input.data.name === "string" ? input.data.name : existing.name
    const isUnique = await ensureUniqueProducerName(
      producerService,
      normalizeProducerName(nextName),
      existing.id
    )

    if (!isUnique) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A producer with this name already exists"
      )
    }

    const updated = await producerService.updateProducers(
      createProducerUpdatePayload(existing, input.data)
    )

    const producer = toProducerRecord(updated as ProducerRecord | ProducerRecord[])

    return new StepResponse(producer, {
      previous: existing,
    } satisfies UpdateProducerCompensation)
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }

    const producerService = container.resolve(PRODUCER_MODULE) as ProducerModuleService

    await producerService.updateProducers(compensation.previous)
  }
)
