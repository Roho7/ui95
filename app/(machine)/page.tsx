import type { Metadata } from "next"

import { Machine } from "@/components/chrome/machine/Machine"
import { JsonLd } from "@/components/docs/JsonLd"
import { REGISTRY_DOCS } from "@/lib/docs/registry-docs"
import { websiteJsonLd } from "@/lib/seo"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <Machine itemCount={REGISTRY_DOCS.length} />
    </>
  )
}
