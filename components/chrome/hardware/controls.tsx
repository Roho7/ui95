"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { usePackageManager } from "@/components/docs/use-package-manager"
import { Legend } from "@/components/hardware/faceplate"
import { Lamp } from "@/components/hardware/lamp"
import { useSoundEnabled } from "@/hooks/use-sound"
import { buildAddCommand, PACKAGE_MANAGERS } from "@/lib/docs/package-managers"

const NAV = [
  { href: "/hardware", label: "Parts", isCurrent: (path: string) => path.startsWith("/hardware") },
  { href: "/docs", label: "Manual", isCurrent: () => false },
  { href: "/components", label: "UI95", isCurrent: () => false },
] as const

const COPIED_MS = 1400

function NavKeys() {
  const path = usePathname()
  return (
    <nav aria-label="Sections" data-part="hw-nav">
      {NAV.map(({ href, label, isCurrent }) => (
        <Link key={href} href={href} data-part="hw-key" data-lit={isCurrent(path) ? "" : undefined} aria-current={isCurrent(path) ? "page" : undefined}>
          <Legend>{label}</Legend>
        </Link>
      ))}
    </nav>
  )
}

function SoundKey() {
  const [isEnabled, setEnabled] = useSoundEnabled()
  return (
    <button type="button" data-part="hw-key" data-slot="button" data-lit={isEnabled ? "" : undefined} aria-pressed={isEnabled} onClick={() => setEnabled(!isEnabled)}>
      <Legend>Sound</Legend>
    </button>
  )
}

function PartIndex({ parts }: { parts: readonly { name: string; title: string }[] }) {
  const path = usePathname()
  return (
    <nav aria-label="Parts">
      <Legend size="sm">Parts index</Legend>
      <ol>
        {parts.map(({ name, title }) => {
          const href = `/hardware/${name}`
          const isCurrent = path === href
          return (
            <li key={name}>
              <Link href={href} aria-current={isCurrent ? "page" : undefined}>
                <Lamp on={isCurrent} tone="amber" />
                {title}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function InstallReadout({ name }: { name: string }) {
  const [manager, chooseManager] = usePackageManager()
  const [isCopied, setCopied] = useState(false)
  const command = buildAddCommand(manager, name)
  const copy = () => {
    void navigator.clipboard?.writeText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), COPIED_MS)
  }
  return (
    <div data-part="hw-readout">
      <div data-part="hw-keys" role="group" aria-label="Package manager">
        {PACKAGE_MANAGERS.map((option) => (
          <button
            key={option.name}
            type="button"
            data-part="hw-key"
            data-slot="button"
            data-lit={option.name === manager.name ? "" : undefined}
            aria-pressed={option.name === manager.name}
            onClick={() => chooseManager(option.name)}
          >
            {option.name}
          </button>
        ))}
      </div>
      <pre data-part="hw-well">
        <code>{command}</code>
      </pre>
      <div data-part="hw-keys">
        <button type="button" data-part="hw-key" data-slot="button" data-lit={isCopied ? "" : undefined} onClick={copy}>
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  )
}

export { InstallReadout, NavKeys, PartIndex, SoundKey }
