import type { StoreProducer } from "@lib/data/producers"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProducerCardProps = {
  producer: StoreProducer
}

const getWebsiteLabel = (website: string) => {
  try {
    return new URL(website).hostname
  } catch {
    return website
  }
}

export default function ProducerCard({ producer }: ProducerCardProps) {
  return (
    <LocalizedClientLink
      className="group flex h-full flex-col justify-between rounded-large border border-grey-20 bg-white p-6 transition-colors hover:border-grey-40"
      href={`/producers/${producer.handle}`}
    >
      <div className="space-y-3">
        <Text className="text-sm uppercase tracking-[0.24em] text-grey-50">
          Producer
        </Text>
        <Text
          as="div"
          className="text-2xl font-semibold leading-tight text-grey-90"
        >
          {producer.name}
        </Text>
        <Text className="text-grey-60">{producer.country}</Text>
        {producer.description ? (
          <Text className="line-clamp-3 text-grey-70">
            {producer.description}
          </Text>
        ) : null}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-grey-20 pt-4 text-sm text-grey-60">
        <span>{getWebsiteLabel(producer.website)}</span>
        <span className="transition-transform group-hover:translate-x-1">
          View
        </span>
      </div>
    </LocalizedClientLink>
  )
}
