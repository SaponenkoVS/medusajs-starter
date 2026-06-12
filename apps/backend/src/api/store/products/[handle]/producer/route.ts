import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { StoreProductProducerQuery } from "./middlewares"
import { getStoreProductProducerByHandle } from "../../../producers/helpers"

type StoreProductProducerRequest = MedusaRequest<StoreProductProducerQuery> & {
  filterableFields: Record<string, unknown>
}

export async function GET(
  req: StoreProductProducerRequest,
  res: MedusaResponse
) {
  const result = await getStoreProductProducerByHandle(
    req.scope,
    req.params.handle,
    req.filterableFields
  )

  res.status(200).json(result)
}
