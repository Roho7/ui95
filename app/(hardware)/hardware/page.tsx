import type { Metadata } from "next"
import Link from "next/link"

import { Bench } from "@/components/chrome/hardware/Bench"
import { InstallReadout } from "@/components/chrome/hardware/controls"
import { Legend } from "@/components/hardware/faceplate"
import { HARDWARE_DOCS } from "@/lib/docs/registry-docs"
import { docHref } from "@/lib/docs/routes"
import { pageMetadata } from "@/lib/seo"

const DESCRIPTION = "Matte beige retro hardware for shadcn: knobs, lamps, meters, switches and displays that look and feel physical. Every part installs from the @ui95 registry and drops into any app."

export const metadata: Metadata = pageMetadata({ title: "Hardware95 parts", description: DESCRIPTION, path: "/hardware", type: "website" })

const TILES = HARDWARE_DOCS.map((doc, index) => ({ doc, model: `HW-${index + 1}` }))

export default function HardwarePartsPage() {
  return (
    <>
      <header data-part="hw-heading">
        <Legend size="sm">Hardware95 · Parts catalogue</Legend>
        <h1>The machine</h1>
        <p>{DESCRIPTION}</p>
      </header>
      <section aria-labelledby="install">
        <h2 id="install">Start with the foundation</h2>
        <InstallReadout name="hardware" />
      </section>
      <section aria-label="Parts" data-part="hw-tiles">
        {TILES.map(({ doc, model }) => (
          <article key={doc.name} data-part="hw-tile">
            <div data-part="hw-tile-head">
              <Link href={docHref(doc.name)}>{doc.title}</Link>
              <Legend size="sm">Model {model}</Legend>
            </div>
            <Bench name={doc.name} only="first" />
            <p>{doc.description}</p>
          </article>
        ))}
      </section>
    </>
  )
}
