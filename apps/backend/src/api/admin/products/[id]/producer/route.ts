import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import assignProductProducerWorkflow from "../../../../../workflows/assign-product-producer"
import { AdminAssignProductProducer } from "./middlewares"
import { getAdminProductProducer } from "../../../producers/helpers"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const result = await getAdminProductProducer(req.scope, req.params.id)

  res.status(200).json(result)
}

export async function POST(
  req: MedusaRequest<AdminAssignProductProducer>,
  res: MedusaResponse
) {
  await assignProductProducerWorkflow(req.scope).run({
    input: {
      product_id: req.params.id,
      producer_id: req.validatedBody.producer_id,
    },
  })

  const result = await getAdminProductProducer(req.scope, req.params.id)

  res.status(200).json(result)
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await assignProductProducerWorkflow(req.scope).run({
    input: {
      product_id: req.params.id,
      producer_id: null,
    },
  })

  const result = await getAdminProductProducer(req.scope, req.params.id)

  res.status(200).json(result)
}
