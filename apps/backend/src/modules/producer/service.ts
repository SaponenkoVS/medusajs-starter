import { MedusaService } from "@medusajs/framework/utils"

import Producer from "./models/producer"

class ProducerModuleService extends MedusaService({
  Producer,
}) {}

export default ProducerModuleService
