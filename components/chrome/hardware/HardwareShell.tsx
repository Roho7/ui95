import "@/components/hardware/hardware.css"
import "./chrome.css"

import Link from "next/link"

import { Faceplate, Legend } from "@/components/hardware/faceplate"
import { Lamp } from "@/components/hardware/lamp"
import { HARDWARE_DOCS } from "@/lib/docs/registry-docs"
import { SOURCE_URL } from "@/lib/site"

import { NavKeys, PartIndex, SoundKey } from "./controls"

const PARTS = HARDWARE_DOCS.map((doc) => ({ name: doc.name, title: doc.title }))

function HardwareShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-hw="" data-part="hw-site">
      <header data-part="hw-masthead">
        <Faceplate screws={false}>
          <div data-part="hw-masthead-row">
            <Link href="/hardware" data-part="hw-brand">
              <Lamp on tone="amber" />
              <span data-part="hw-brand-name">Hardware95</span>
              <Legend size="sm">Physical parts for shadcn</Legend>
            </Link>
            <NavKeys />
            <SoundKey />
          </div>
        </Faceplate>
      </header>
      <div data-part="hw-body">
        <aside data-part="hw-index">
          <Faceplate>
            <PartIndex parts={PARTS} />
          </Faceplate>
        </aside>
        <main data-part="hw-main">{children}</main>
      </div>
      <footer data-part="hw-footer">
        <Legend size="sm">Hardware95 · the machine that runs UI95</Legend>
        <Legend size="sm">
          <a href={SOURCE_URL}>Source on GitHub</a>
        </Legend>
      </footer>
    </div>
  )
}

export { HardwareShell }
