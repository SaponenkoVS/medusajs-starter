import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getProducer } from "@lib/data/producers"
import { getRegion } from "@lib/data/regions"
import ProducerDetailTemplate from "@modules/producers/templates/producer-detail-template"

type ProducerDetailPageProps = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({
  params,
}: ProducerDetailPageProps): Promise<Metadata> {
  const { countryCode, handle } = await params

  try {
    const { producer } = await getProducer({
      countryCode,
      handle,
    })

    return {
      title: `${producer.name} | Producers`,
      description: producer.description ?? `${producer.name} producer page`,
    }
  } catch {
    return {
      title: "Producer",
    }
  }
}

export default async function ProducerDetailPage({
  params,
  searchParams,
}: ProducerDetailPageProps) {
  const { countryCode, handle } = await params
  const { page: rawPage } = await searchParams
  const page = rawPage ? Math.max(Number.parseInt(rawPage, 10), 1) : 1
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  let detail

  try {
    detail = await getProducer({
      countryCode,
      handle,
      page,
    })
  } catch {
    notFound()
  }

  return (
    <ProducerDetailTemplate
      page={page}
      producer={detail.producer}
      products={detail.products}
      region={region}
      totalCount={detail.count}
    />
  )
}
