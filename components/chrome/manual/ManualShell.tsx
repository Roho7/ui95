import "./manual.css"

import Link from "next/link"

import { MANUAL_PAGES } from "@/lib/docs/pages"

import { ManualContents } from "./ManualContents"

function ManualShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-part="manual-site">
      <article data-part="manual-page">
        <header data-part="manual-header">
          <Link href="/docs" data-part="manual-title">
            Operator&apos;s manual · Hardware95 / UI95
          </Link>
          <nav aria-label="Libraries">
            <Link href="/hardware">Hardware95</Link>
            <Link href="/ui">UI95</Link>
          </nav>
        </header>
        <div data-part="manual-body">
          <ManualContents pages={MANUAL_PAGES} />
          <main data-part="manual-main">{children}</main>
        </div>
      </article>
    </div>
  )
}

export { ManualShell }
