import { Metadata } from "next"

import { listProducers } from "@lib/data/producers"
import ProducersListTemplate from "@modules/producers/templates/producers-list-template"

export const metadata: Metadata = {
  title: "Producers",
  description: "Browse the producers behind the store catalog.",
}

type ProducersPageProps = {
  params: Promise<{ countryCode: string }>
}

export default async function ProducersPage({
  params,
}: ProducersPageProps) {
  const { countryCode } = await params
  const { producers } = await listProducers({
    countryCode,
  })

  return <ProducersListTemplate producers={producers} />
}
