import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"

const PAGE_SIZE = 12

type ProducerProductGridProps = {
  page: number
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  totalCount: number
}

export default function ProducerProductGrid({
  page,
  products,
  region,
  totalCount,
}: ProducerProductGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-large border border-dashed border-grey-30 bg-grey-5 px-6 py-10">
        <Text as="div" className="text-lg font-semibold text-grey-90">
          No products are currently available in this region.
        </Text>
        <Text className="mt-2 text-grey-60">
          Check back later or switch to another region to browse this producer&apos;s
          catalog.
        </Text>
      </div>
    )
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-3 medium:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
      {totalPages > 1 ? (
        <Pagination
          data-testid="producer-products-pagination"
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  )
}
