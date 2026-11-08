import React from "react"

import { DocsTaskbar } from "@/app/_site/DocsTaskbar"
import { ProgramMain, ProgramWindow } from "@/app/_site/ProgramWindow"
import { SidebarNav } from "@/components/docs/SidebarNav"
import { SiteMenuRow } from "@/components/docs/SiteMenuRow"
import { SHOWCASE_ENTRIES } from "@/components/showcase/demos.generated"
import { ShowcaseCard } from "@/components/showcase/ShowcaseCard"
import type { ShowcaseEntry } from "@/components/showcase/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DOC_GROUPS } from "@/lib/docs/pages"

import { useSettleOnMount } from "./useSettle"

const ENTRIES_BEFORE = 2
const ENTRIES_AFTER = 7
const SCROLL_MARGIN = 420
const LATE_SCROLL_MS = 150

function withOverride(entry: ShowcaseEntry, render: () => React.ReactNode): ShowcaseEntry {
  const [first, ...rest] = entry.demo.variants
  return { ...entry, demo: { ...entry.demo, variants: [{ label: first.label, render }, ...rest] } }
}

function useScrollTo(entryName: string) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const shiftRef = React.useRef(0)
  const scroll = React.useCallback(() => {
    const root = rootRef.current
    const main = root?.querySelector<HTMLElement>("main")
    const viewport = main?.closest<HTMLElement>("[data-slot=scroll-area-viewport]")
    const card = root?.querySelector<HTMLElement>("[data-focus]") ?? root?.querySelector<HTMLElement>(`#${CSS.escape(entryName)}`)
    if (!root || !main || !viewport || !card) {
      return
    }
    const unit = root.getBoundingClientRect().width / root.offsetWidth
    if (unit === 0) {
      return
    }
    const offset = (card.getBoundingClientRect().top - viewport.getBoundingClientRect().top) / unit
    shiftRef.current = Math.round(shiftRef.current + offset - SCROLL_MARGIN)
    main.style.translate = `0 ${-shiftRef.current}px`
  }, [entryName])

  React.useLayoutEffect(scroll, [scroll])

  React.useEffect(() => {
    const timeout = window.setTimeout(scroll, LATE_SCROLL_MS)
    void document.fonts.ready.then(scroll)
    return () => window.clearTimeout(timeout)
  }, [scroll])
  return rootRef
}

type BentoWorldProps = {
  entryName: string
  render: () => React.ReactNode
}

export function BentoWorld({ entryName, render }: BentoWorldProps) {
  useSettleOnMount("Components page")
  const rootRef = useScrollTo(entryName)
  const index = Math.max(0, SHOWCASE_ENTRIES.findIndex((entry) => entry.name === entryName))
  const start = Math.max(0, index - ENTRIES_BEFORE)
  const entries = SHOWCASE_ENTRIES.slice(start, index + ENTRIES_AFTER)

  return (
    <div ref={rootRef} data-world="bento" className="absolute inset-0 bg-desktop">
      <ProgramWindow>
        <SiteMenuRow />
        <div className="flex min-h-0 flex-1">
          <aside className="h-full w-64 shrink-0 border-r-(length:--pixel) border-border">
            <ScrollArea className="h-full">
              <SidebarNav groups={DOC_GROUPS} />
            </ScrollArea>
          </aside>
          <ProgramMain>
            <header className="flex flex-col gap-3">
              <h1 className="font-pixel text-[48px] leading-none uppercase">Components</h1>
              <p className="max-w-xl text-xl leading-tight">
                Every item in the @ui95 registry with every variant it ships. Pick one, copy the command, own the code.
              </p>
            </header>
            <section aria-label="Component catalogue" className="flex flex-col gap-6">
              <p className="flex items-center gap-3 font-pixel text-[16px] leading-none uppercase">
                <span>Catalogue No. 1</span>
                <span aria-hidden="true" className="h-4 min-w-6 flex-1 stripes" />
                <span>{SHOWCASE_ENTRIES.length} items</span>
              </p>
              <div className="grid grid-flow-row-dense auto-rows-[minmax(14rem,auto)] grid-cols-12 gap-6">
                {entries.map((entry, offset) => (
                  <ShowcaseCard
                    key={entry.name}
                    entry={entry.name === entryName ? withOverride(entry, render) : entry}
                    index={start + offset}
                  />
                ))}
              </div>
            </section>
          </ProgramMain>
        </div>
      </ProgramWindow>
      <DocsTaskbar />
    </div>
  )
}
