import type { StoreProducer } from "@lib/data/producers"
import { Heading, Text } from "@modules/common/components/ui"

import ProducerCard from "../components/producer-card"

type ProducersListTemplateProps = {
  producers: StoreProducer[]
}

export default function ProducersListTemplate({
  producers,
}: ProducersListTemplateProps) {
  return (
    <div className="content-container py-10">
      <div className="mb-10 max-w-3xl">
        <Text className="text-sm uppercase tracking-[0.24em] text-grey-50">
          Directory
        </Text>
        <Heading className="mt-3 text-4xl text-grey-90" level="h1">
          Producers
        </Heading>
        <Text className="mt-4 text-grey-70">
          Explore the manufacturers behind the products in the catalog.
        </Text>
      </div>

      {producers.length ? (
        <div className="grid grid-cols-1 gap-6 small:grid-cols-2 medium:grid-cols-3">
          {producers.map((producer) => (
            <ProducerCard key={producer.id} producer={producer} />
          ))}
        </div>
      ) : (
        <div className="rounded-large border border-dashed border-grey-30 bg-grey-5 px-6 py-10">
          <Text as="div" className="text-lg font-semibold text-grey-90">
            No producers are visible right now.
          </Text>
          <Text className="mt-2 text-grey-60">
            Producers will appear here once they have published products in the
            catalog.
          </Text>
        </div>
      )}
    </div>
  )
}
