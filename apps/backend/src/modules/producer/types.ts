export type ProducerRecord = {
  id: string
  name: string
  normalized_name: string
  handle: string
  country: string
  website: string
  description: string | null
  is_active: boolean
}

export type UpsertProducerInput = {
  name: string
  country: string
  website: string
  description?: string | null
  is_active?: boolean
}
