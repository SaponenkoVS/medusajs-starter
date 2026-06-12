import path from "path"

import { moduleIntegrationTestRunner } from "@medusajs/test-utils"

import { PRODUCER_MODULE } from ".."
import type ProducerModuleService from "../service"

moduleIntegrationTestRunner<ProducerModuleService>({
  moduleName: PRODUCER_MODULE,
  resolve: path.resolve(__dirname, ".."),
  testSuite: ({ service }) => {
    describe("producer module", () => {
      it("creates and lists producers", async () => {
        await service.createProducers({
          name: "Acme Manufacturing",
          normalized_name: "acme manufacturing",
          handle: "acme-manufacturing",
          country: "Germany",
          website: "https://acme.example",
          description: "Precision maker",
          is_active: true,
        })

        const [producers, count] = await service.listAndCountProducers({})

        expect(count).toBe(1)
        expect(producers).toHaveLength(1)
        expect(producers[0]).toEqual(
          expect.objectContaining({
            name: "Acme Manufacturing",
            handle: "acme-manufacturing",
            country: "Germany",
            is_active: true,
          })
        )
      })

      it("updates existing producers", async () => {
        const created = await service.createProducers({
          name: "Original Producer",
          normalized_name: "original producer",
          handle: "original-producer",
          country: "Poland",
          website: "https://original.example",
          description: null,
          is_active: true,
        })

        const producer = Array.isArray(created) ? created[0] : created

        await service.updateProducers({
          id: producer.id,
          name: "Updated Producer",
          normalized_name: "updated producer",
          handle: "original-producer",
          country: "France",
          website: "https://updated.example",
          description: "Updated description",
          is_active: false,
        })

        const updated = await service.retrieveProducer(producer.id)

        expect(updated).toEqual(
          expect.objectContaining({
            id: producer.id,
            name: "Updated Producer",
            normalized_name: "updated producer",
            handle: "original-producer",
            country: "France",
            website: "https://updated.example",
            description: "Updated description",
            is_active: false,
          })
        )
      })

      it("deletes producers", async () => {
        const created = await service.createProducers({
          name: "Disposable Producer",
          normalized_name: "disposable producer",
          handle: "disposable-producer",
          country: "Italy",
          website: "https://disposable.example",
          description: null,
          is_active: true,
        })

        const producer = Array.isArray(created) ? created[0] : created

        await service.deleteProducers(producer.id)

        const [producers, count] = await service.listAndCountProducers({})

        expect(count).toBe(0)
        expect(producers).toHaveLength(0)
      })
    })
  },
})
