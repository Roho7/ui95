"use client"

import Link from "next/link"

import { Legend } from "@/components/hardware/faceplate"
import { SHOWCASE_ENTRIES } from "@/components/showcase/demos.generated"

type BenchProps = {
  name: string
  only?: number
}

function Bench({ name, only }: BenchProps) {
  const variants = SHOWCASE_ENTRIES.find((entry) => entry.name === name)?.demo.variants ?? []
  const shown = only === undefined ? variants : variants.slice(only, only + 1)
  return (
    <section aria-label="Bench" data-part="hw-bench">
      {shown.map((variant, index) => (
        <figure key={variant.label}>
          {only === undefined && (
            <figcaption>
              {String.fromCharCode(65 + index)} · {variant.label}
            </figcaption>
          )}
          <div>{variant.render()}</div>
        </figure>
      ))}
    </section>
  )
}


type BentoPart = { name: string; title: string; model: string; href: string }

function BenchBento({ parts }: { parts: readonly BentoPart[] }) {
  const tiles = parts.flatMap((part) =>
    (SHOWCASE_ENTRIES.find((entry) => entry.name === part.name)?.demo.variants ?? []).map((variant, index) => ({ part, variant, index }))
  )
  return (
    <section aria-label="Parts" data-part="hw-bento">
      {tiles.map(({ part, variant, index }) => (
        <article key={`${part.name}-${variant.label}`} data-part="hw-tile" data-wide={index === 0 ? "" : undefined}>
          <div data-part="hw-tile-head">
            <Link href={part.href}>{part.title}</Link>
            <Legend size="sm">
              {part.model} · {variant.label}
            </Legend>
          </div>
          <Bench name={part.name} only={index} />
        </article>
      ))}
    </section>
  )
}

export { Bench, BenchBento }
