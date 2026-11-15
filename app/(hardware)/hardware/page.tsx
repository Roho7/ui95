import type { Metadata } from "next"

import { BenchBento } from "@/components/chrome/hardware/Bench"
import { Legend } from "@/components/hardware/faceplate"
import { HARDWARE_DOCS } from "@/lib/docs/registry-docs"
import { docHref } from "@/lib/docs/routes"
import { pageMetadata } from "@/lib/seo"

const DESCRIPTION = "Matte beige retro hardware for shadcn: knobs, lamps, meters, switches and displays that look and feel physical. Open any part in its control panel to change its props and copy a prompt for your agent."

export const metadata: Metadata = pageMetadata({ title: "Hardware95 parts", description: DESCRIPTION, path: "/hardware", type: "website" })

const PARTS = HARDWARE_DOCS.map((doc, index) => ({ name: doc.name, title: doc.title, model: `HW-${index + 1}`, href: docHref(doc.name) }))

export default function HardwarePartsPage() {
  return (
    <>
      <header data-part="hw-heading">
        <Legend size="sm">Hardware95 · Parts catalogue</Legend>
        <h1>The machine</h1>
        <p>{DESCRIPTION}</p>
      </header>
      <BenchBento parts={PARTS} />
    </>
  )
}
