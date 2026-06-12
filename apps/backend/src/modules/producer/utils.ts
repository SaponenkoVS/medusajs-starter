import slugify from "slugify"

import type ProducerModuleService from "./service"
import type { ProducerRecord, UpsertProducerInput } from "./types"

export const normalizeProducerName = (name: string) => {
  return name.trim().replace(/\s+/g, " ").toLowerCase()
}

export const normalizeProducerDescription = (description?: string | null) => {
  if (typeof description !== "string") {
    return null
  }

  const trimmed = description.trim()

  return trimmed.length ? trimmed : null
}

export const buildProducerHandleBase = (name: string) => {
  const normalized = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  })

  return normalized.length ? normalized : "producer"
}

export const createProducerWritePayload = (
  input: UpsertProducerInput,
  handle: string
) => {
  return {
    name: input.name.trim(),
    normalized_name: normalizeProducerName(input.name),
    handle,
    country: input.country.trim(),
    website: input.website.trim(),
    description: normalizeProducerDescription(input.description),
    is_active: input.is_active ?? true,
  }
}

export const createProducerUpdatePayload = (
  current: ProducerRecord,
  input: Partial<UpsertProducerInput>
) => {
  const nextName = typeof input.name === "string" ? input.name.trim() : current.name
  const nextCountry =
    typeof input.country === "string" ? input.country.trim() : current.country
  const nextWebsite =
    typeof input.website === "string" ? input.website.trim() : current.website

  return {
    id: current.id,
    name: nextName,
    normalized_name: normalizeProducerName(nextName),
    handle: current.handle,
    country: nextCountry,
    website: nextWebsite,
    description:
      input.description !== undefined
        ? normalizeProducerDescription(input.description)
        : current.description,
    is_active:
      typeof input.is_active === "boolean" ? input.is_active : current.is_active,
  }
}

const firstProducer = <T>(value: T | T[]) => {
  return Array.isArray(value) ? value[0] : value
}

export const ensureUniqueProducerName = async (
  service: ProducerModuleService,
  normalizedName: string,
  excludeId?: string
) => {
  const matches = await service.listProducers({
    normalized_name: normalizedName,
  })

  const conflict = matches.find((item) => item.id !== excludeId)

  return !conflict
}

export const createUniqueProducerHandle = async (
  service: ProducerModuleService,
  baseHandle: string
) => {
  let nextHandle = baseHandle
  let suffix = 2

  while (true) {
    const existing = await service.listProducers({
      handle: nextHandle,
    })

    if (!existing.length) {
      return nextHandle
    }

    nextHandle = `${baseHandle}-${suffix}`
    suffix += 1
  }
}

export const toProducerRecord = <T extends ProducerRecord>(value: T | T[]) => {
  return firstProducer(value)
}
