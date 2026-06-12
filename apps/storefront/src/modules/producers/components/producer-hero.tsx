import type { StoreProducer } from "@lib/data/producers"
import { Heading, Text } from "@modules/common/components/ui"

type ProducerHeroProps = {
  producer: StoreProducer
}

export default function ProducerHero({ producer }: ProducerHeroProps) {
  return (
    <div className="rounded-large border border-grey-20 bg-gradient-to-br from-white via-grey-5 to-grey-10 p-8">
      <Text className="text-sm uppercase tracking-[0.24em] text-grey-50">
        Producer
      </Text>
      <Heading className="mt-3 text-4xl text-grey-90" level="h1">
        {producer.name}
      </Heading>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="rounded-circle border border-grey-30 px-3 py-1 text-sm text-grey-70">
          {producer.country}
        </span>
        <a
          className="text-sm font-medium text-grey-90 underline underline-offset-4"
          href={producer.website}
          rel="noreferrer"
          target="_blank"
        >
          Visit website
        </a>
      </div>
      {producer.description ? (
        <Text className="mt-6 max-w-3xl text-grey-70">
          {producer.description}
        </Text>
      ) : null}
    </div>
  )
}
