import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { StoreProducerDetailQuery } from "../middlewares"
import { getStoreProducerByHandle } from "../helpers"

type StoreProducerDetailRequest = MedusaRequest<StoreProducerDetailQuery> & {
  filterableFields: Record<string, unknown>
}

export async function GET(
  req: StoreProducerDetailRequest,
  res: MedusaResponse
) {
  const result = await getStoreProducerByHandle(req.scope, req.params.handle, {
    limit: req.validatedQuery.limit,
    offset: req.validatedQuery.offset,
  }, req.filterableFields)

  res.status(200).json(result)
}
