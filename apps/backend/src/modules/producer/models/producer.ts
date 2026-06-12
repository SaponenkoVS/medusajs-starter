import { model } from "@medusajs/framework/utils"

const Producer = model.define("producer", {
  id: model.id().primaryKey(),
  name: model.text(),
  normalized_name: model.text(),
  handle: model.text().searchable(),
  country: model.text(),
  website: model.text(),
  description: model.text().nullable(),
  is_active: model.boolean().default(true),
})

export default Producer
