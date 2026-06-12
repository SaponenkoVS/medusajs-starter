import {
  createWorkflow,
  transform,
  WorkflowResponse,
  when,
} from "@medusajs/framework/workflows-sdk"

import { removeProductProducerLinkStep } from "./steps/remove-product-producer-link"
import { setProductProducerLinkStep } from "./steps/set-product-producer-link"

type AssignProductProducerWorkflowInput = {
  product_id: string
  producer_id?: string | null
}

const assignProductProducerWorkflow = createWorkflow(
  "assign-product-producer",
  function (input: AssignProductProducerWorkflowInput) {
    const cleared = removeProductProducerLinkStep({
      productId: input.product_id,
    })

    const shouldAssignProducer = transform({ input }, function ({ input }) {
      return Boolean(input.producer_id)
    })

    when(shouldAssignProducer, function (shouldAssign) {
      return shouldAssign
    }).then(function () {
      const assignmentInput = transform({ input }, function ({ input }) {
        if (!input.producer_id) {
          throw new Error("Producer id is required when assigning a producer")
        }

        return {
          productId: input.product_id,
          producerId: input.producer_id,
        }
      })

      setProductProducerLinkStep(assignmentInput)
    })

    return new WorkflowResponse({
      assignment: cleared,
    })
  }
)

export default assignProductProducerWorkflow
