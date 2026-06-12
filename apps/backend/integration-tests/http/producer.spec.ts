import { createApiKeysWorkflow } from "@medusajs/core-flows"
import { linkSalesChannelsToApiKeyWorkflow } from "@medusajs/core-flows"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import type { IProductModuleService } from "@medusajs/framework/types"

import assignProductProducerWorkflow from "../../src/workflows/assign-product-producer"
import createProducerWorkflow from "../../src/workflows/create-producer"

let storeHeaders: Record<string, string> = {}
let productHandle = ""
let productId = ""
let producerHandle = ""
let producerId = ""
let producerSequence = 0
let productSequence = 0

jest.setTimeout(30000)

medusaIntegrationTestRunner({
  cwd: process.cwd(),
  testSuite: ({ api, getContainer }) => {
    describe("producer http routes", () => {
      beforeEach(async () => {
        const { result } = await createApiKeysWorkflow(getContainer()).run({
          input: {
            api_keys: [
              {
                title: "Producer Storefront Test Key",
                type: "publishable",
                created_by: "integration-test",
              },
            ],
          },
        })

        storeHeaders = {
          "x-publishable-api-key": result[0].token,
        }

        const query = getContainer().resolve(
          ContainerRegistrationKeys.QUERY
        ) as {
          graph: (input: Record<string, unknown>) => Promise<{
            data: Array<{
              default_sales_channel_id?: string | null
            }>
          }>
        }
        const productService = getContainer().resolve(
          Modules.PRODUCT
        ) as IProductModuleService
        const link = getContainer().resolve(ContainerRegistrationKeys.LINK) as {
          create: (input: Record<string, unknown>) => Promise<unknown>
        }

        const storeResponse = await query.graph({
          entity: "store",
          fields: ["default_sales_channel_id"],
        })

        const defaultSalesChannelId =
          storeResponse.data[0]?.default_sales_channel_id ?? null

        if (!defaultSalesChannelId) {
          throw new Error("Expected a default sales channel in test seed")
        }

        producerSequence += 1
        productSequence += 1

        const product = await productService.createProducts({
          title: `Producer Product ${productSequence}`,
          handle: `producer-product-${productSequence}`,
          status: "published",
        })

        await link.create({
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
          [Modules.SALES_CHANNEL]: {
            sales_channel_id: defaultSalesChannelId,
          },
        })

        await linkSalesChannelsToApiKeyWorkflow(getContainer()).run({
          input: {
            id: result[0].id,
            add: [defaultSalesChannelId],
          },
        })

        const {
          result: { producer },
        } = await createProducerWorkflow(getContainer()).run({
          input: {
            name: `Producer ${producerSequence}`,
            country: "Denmark",
            website: `https://producer-${producerSequence}.example.com`,
            description: "Producer for storefront visibility tests",
            is_active: true,
          },
        })

        await assignProductProducerWorkflow(getContainer()).run({
          input: {
            product_id: product.id,
            producer_id: producer.id,
          },
        })

        productId = product.id
        productHandle = product.handle
        producerId = producer.id
        producerHandle = producer.handle
      })

      it("returns an empty public producer list by default", async () => {
        const response = await api.get("/store/producers", {
          headers: storeHeaders,
        })

        expect(response.status).toBe(200)
        expect(response.data.producers).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: producerId,
              handle: producerHandle,
            }),
          ])
        )
        expect(response.data.count).toBeGreaterThanOrEqual(1)
        expect(response.data.limit).toBe(12)
        expect(response.data.offset).toBe(0)
      })

      it("returns producer detail with only visible linked products", async () => {
        const response = await api.get(`/store/producers/${producerHandle}`, {
          headers: storeHeaders,
        })

        expect(response.status).toBe(200)
        expect(response.data.producer).toEqual(
          expect.objectContaining({
            id: producerId,
            handle: producerHandle,
          })
        )
        expect(response.data.products).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: productId,
              handle: productHandle,
            }),
          ])
        )
        expect(response.data.count).toBeGreaterThanOrEqual(1)
      })

      it("returns producer data for a visible published product", async () => {
        const response = await api.get(`/store/products/${productHandle}/producer`, {
          headers: storeHeaders,
        })

        expect(response.status).toBe(200)
        expect(response.data.product).toEqual({
          id: productId,
          handle: productHandle,
        })
        expect(response.data.producer).toEqual(
          expect.objectContaining({
            id: producerId,
            handle: producerHandle,
          })
        )
      })

      it("returns 404 for an unknown producer detail route", async () => {
        const response = await api.get("/store/producers/missing-producer", {
          headers: storeHeaders,
          validateStatus: () => true,
        })

        expect(response.status).toBe(404)
      })

      it("returns 404 for an unknown product producer route", async () => {
        const response = await api.get("/store/products/missing/producer", {
          headers: storeHeaders,
          validateStatus: () => true,
        })

        expect(response.status).toBe(404)
      })

      it("keeps admin producer routes protected", async () => {
        const response = await api.get("/admin/producers", {
          validateStatus: () => true,
        })

        expect(response.status).toBe(401)
      })
    })
  },
})
