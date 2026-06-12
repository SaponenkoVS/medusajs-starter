import {
  buildProducerHandleBase,
  createProducerUpdatePayload,
  createProducerWritePayload,
  normalizeProducerDescription,
  normalizeProducerName,
} from "../utils"

describe("producer utils", () => {
  it("normalizes producer names for uniqueness checks", () => {
    expect(normalizeProducerName("  Acme   Manufacturing  ")).toBe(
      "acme manufacturing"
    )
  })

  it("removes empty descriptions", () => {
    expect(normalizeProducerDescription("   ")).toBeNull()
    expect(normalizeProducerDescription("Built in Europe")).toBe(
      "Built in Europe"
    )
  })

  it("creates stable write and update payloads", () => {
    const created = createProducerWritePayload(
      {
        name: "Acme Manufacturing",
        country: "Germany",
        website: "https://acme.example",
        description: "  Precision maker  ",
        is_active: true,
      },
      buildProducerHandleBase("Acme Manufacturing")
    )

    expect(created).toEqual({
      name: "Acme Manufacturing",
      normalized_name: "acme manufacturing",
      handle: "acme-manufacturing",
      country: "Germany",
      website: "https://acme.example",
      description: "Precision maker",
      is_active: true,
    })

    const updated = createProducerUpdatePayload(
      {
        id: "producer_123",
        name: "Acme Manufacturing",
        normalized_name: "acme manufacturing",
        handle: "acme-manufacturing",
        country: "Germany",
        website: "https://acme.example",
        description: "Precision maker",
        is_active: true,
      },
      {
        name: "Acme Manufacturing GmbH",
        country: "Germany",
        website: "https://acme.example",
        description: "",
        is_active: false,
      }
    )

    expect(updated).toEqual({
      id: "producer_123",
      name: "Acme Manufacturing GmbH",
      normalized_name: "acme manufacturing gmbh",
      handle: "acme-manufacturing",
      country: "Germany",
      website: "https://acme.example",
      description: null,
      is_active: false,
    })
  })
})
