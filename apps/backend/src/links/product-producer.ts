import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import ProducerModule from "../modules/producer"

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  ProducerModule.linkable.producer
)
