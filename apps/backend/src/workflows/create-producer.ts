import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import type { UpsertProducerInput } from "../modules/producer/types"
import { createProducerStep } from "./steps/create-producer"

const createProducerWorkflow = createWorkflow(
  "create-producer",
  function (input: UpsertProducerInput) {
    const producer = createProducerStep(input)

    return new WorkflowResponse({
      producer,
    })
  }
)

export default createProducerWorkflow
