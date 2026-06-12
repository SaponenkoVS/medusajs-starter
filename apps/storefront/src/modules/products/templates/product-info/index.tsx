import type { StoreProductProducerResponse } from "@lib/data/producers"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  producer: StoreProductProducerResponse["producer"]
}

const ProductInfo = ({ product, producer }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>

        {producer ? (
          <div className="rounded-large border border-grey-20 bg-grey-5 p-4">
            <Text className="text-sm uppercase tracking-[0.24em] text-grey-50">
              Producer
            </Text>
            <LocalizedClientLink
              className="mt-2 block text-lg font-semibold text-grey-90"
              href={`/producers/${producer.handle}`}
            >
              {producer.name}
            </LocalizedClientLink>
            <Text className="mt-1 text-grey-70">{producer.country}</Text>
            <a
              className="mt-3 inline-flex text-sm font-medium text-grey-90 underline underline-offset-4"
              href={producer.website}
              rel="noreferrer"
              target="_blank"
            >
              Visit website
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ProductInfo
