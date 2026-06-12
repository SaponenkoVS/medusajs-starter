import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import type { UpsertProducerInput } from "../modules/producer/types"
import { updateProducerStep } from "./steps/update-producer"

type UpdateProducerWorkflowInput = {
  id: string
  data: Partial<UpsertProducerInput>
}

const updateProducerWorkflow = createWorkflow(
  "update-producer",
  function (input: UpdateProducerWorkflowInput) {
    const producer = updateProducerStep(input)

    return new WorkflowResponse({
      producer,
    })
  }
)

export default updateProducerWorkflow
