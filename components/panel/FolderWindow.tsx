"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

export type FolderEntry = { name: string; title: string; group: string; href: string }

function matches(entry: FolderEntry, query: string): boolean {
  const needle = query.trim().toLowerCase()
  return needle === "" || entry.title.toLowerCase().includes(needle) || entry.name.includes(needle)
}

function FolderWindow({ entries, current }: { entries: readonly FolderEntry[]; current: string }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const shown = entries.filter((entry) => matches(entry, query))
  const groups = [...new Set(shown.map((entry) => entry.group))]
  const openFirst = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && shown[0]) {
      router.push(shown[0].href)
    }
    if (event.key === "Escape") {
      setQuery("")
    }
  }
  return (
    <section data-part="panel-folders" data-panel-box="" aria-label="Components">
      <header data-panel-caption="" data-part="panel-folders-bar">
        <span>Components</span>
        <input type="search" aria-label="Search components" placeholder="Search" data-panel-text="" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={openFirst} />
      </header>
      <div data-panel-body="">
        {groups.map((group) => (
          <div key={group} data-part="panel-folder-group">
            {groups.length > 1 && <p data-part="panel-folder-heading">{group}</p>}
            <ul>
              {shown
                .filter((entry) => entry.group === group)
                .map((entry) => (
                  <li key={entry.name}>
                    <Link href={entry.href} data-part="panel-folder" aria-current={entry.name === current ? "page" : undefined}>
                      <span aria-hidden data-part="panel-folder-icon" />
                      <span>{entry.title}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        {shown.length === 0 && <p data-part="panel-folder-empty">No component matches {query}.</p>}
      </div>
    </section>
  )
}

export { FolderWindow }
