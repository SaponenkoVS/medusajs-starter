import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { StoreProducerListQuery } from "./middlewares"
import { listStoreProducers } from "./helpers"

type StoreProducerListRequest = MedusaRequest<StoreProducerListQuery> & {
  filterableFields: Record<string, unknown>
}

export async function GET(
  req: StoreProducerListRequest,
  res: MedusaResponse
) {
  const result = await listStoreProducers(
    req.scope,
    req.validatedQuery,
    req.filterableFields
  )

  res.status(200).json(result)
}
