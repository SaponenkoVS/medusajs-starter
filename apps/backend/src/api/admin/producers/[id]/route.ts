import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import updateProducerWorkflow from "../../../../workflows/update-producer"
import deleteProducerWorkflow from "../../../../workflows/delete-producer"
import { AdminUpdateProducer } from "../middlewares"
import { getProducerDetail } from "../helpers"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const result = await getProducerDetail(req.scope, req.params.id)

  res.status(200).json(result)
}

export async function POST(
  req: MedusaRequest<AdminUpdateProducer>,
  res: MedusaResponse
) {
  const { result } = await updateProducerWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      data: req.validatedBody,
    },
  })

  res.status(200).json(result)
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await deleteProducerWorkflow(req.scope).run({
    input: {
      id: req.params.id,
    },
  })

  res.status(200).json({
    id: req.params.id,
    object: "producer",
    deleted: result.deleted.deleted,
  })
}
