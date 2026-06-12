import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

import { deleteProducerStep } from "./steps/delete-producer"

type DeleteProducerWorkflowInput = {
  id: string
}

const deleteProducerWorkflow = createWorkflow(
  "delete-producer",
  function (input: DeleteProducerWorkflowInput) {
    const { data: producers } = useQueryGraphStep({
      entity: "producer",
      fields: ["id", "products.id"],
      filters: {
        id: input.id,
      },
    })

    const linkedProductCount = transform({ producers }, function ({ producers }) {
      const producer = producers[0] as { products?: Array<{ id: string }> } | undefined

      return producer?.products?.length ?? 0
    })

    const deleted = deleteProducerStep({
      id: input.id,
      linkedProductCount,
    })

    return new WorkflowResponse({
      deleted,
    })
  }
)

export default deleteProducerWorkflow
