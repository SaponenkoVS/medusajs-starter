import type { StoreProducer } from "@lib/data/producers"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"

import ProducerHero from "../components/producer-hero"
import ProducerProductGrid from "../components/producer-product-grid"

type ProducerDetailTemplateProps = {
  page: number
  producer: StoreProducer
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  totalCount: number
}

export default function ProducerDetailTemplate({
  page,
  producer,
  products,
  region,
  totalCount,
}: ProducerDetailTemplateProps) {
  return (
    <div className="content-container py-10">
      <ProducerHero producer={producer} />
      <div className="mt-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Text className="text-sm uppercase tracking-[0.24em] text-grey-50">
              Catalog
            </Text>
            <Heading className="mt-2 text-2xl text-grey-90" level="h2">
              Available products
            </Heading>
          </div>
          <Text className="text-grey-60">
            {totalCount} {totalCount === 1 ? "product" : "products"}
          </Text>
        </div>
        <ProducerProductGrid
          page={page}
          products={products}
          region={region}
          totalCount={totalCount}
        />
      </div>
    </div>
  )
}
