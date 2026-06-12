import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import createProducerWorkflow from "../../../workflows/create-producer"
import {
  AdminCreateProducer,
  AdminProducerListQuery,
} from "./middlewares"
import { getProducerList } from "./helpers"

export async function GET(
  req: MedusaRequest<AdminProducerListQuery>,
  res: MedusaResponse
) {
  const result = await getProducerList(req.scope, req.validatedQuery)

  res.status(200).json(result)
}

export async function POST(
  req: MedusaRequest<AdminCreateProducer>,
  res: MedusaResponse
) {
  const { result } = await createProducerWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(200).json(result)
}
