import type { Metadata } from "next"
import Link from "next/link"

import { DocSection, PageHeader, PageNeighbors, Prose } from "@/components/chrome/manual/parts"
import { JsonLd } from "@/components/docs/JsonLd"
import { GUIDE } from "@/lib/docs/pages"
import { articleJsonLd, pageMetadata } from "@/lib/seo"

const PAGE = GUIDE.system

export const metadata: Metadata = pageMetadata({ title: PAGE.title, description: PAGE.description, path: PAGE.href })

export default function SystemPage() {
  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: PAGE.title,
          description: PAGE.description,
          path: PAGE.href,
          crumbs: [{ name: "Manual", path: PAGE.href }],
        })}
      />
      <PageHeader title={PAGE.title} description={PAGE.description} />
      <DocSection id="machine" title="1.1 Hardware95 is the machine">
        <Prose>
          Knobs, switches, lamps, meters and displays in matte beige plastic, lit from the top-left and clicking at every
          detent. Hardware95 parts are physical controls for any shadcn app. Browse them in the{" "}
          <Link href="/hardware">parts catalogue</Link>.
        </Prose>
      </DocSection>
      <DocSection id="software" title="1.2 UI95 is the software on its screen">
        <Prose>
          Windows, menus, buttons, a taskbar and a desktop in 1-bit Win95 style. UI95 reskins shadcn components and adds
          retro compositions. Browse them in the <Link href="/ui">UI95 catalogue</Link>.
        </Prose>
      </DocSection>
      <DocSection id="one-registry" title="1.3 One registry for both">
        <Prose>
          Both libraries install from the same <code>@ui95</code> namespace, so one setup serves either or both. Sound is
          shared: one player clicks for every part and component. Chapter 2 covers installation and chapter 3 covers
          sound.
        </Prose>
      </DocSection>
      <PageNeighbors href={PAGE.href} />
    </>
  )
}
