"use client"

import { SHOWCASE_ENTRIES } from "@/components/showcase/demos.generated"

type BenchProps = {
  name: string
  only?: "first"
}

function Bench({ name, only }: BenchProps) {
  const variants = SHOWCASE_ENTRIES.find((entry) => entry.name === name)?.demo.variants ?? []
  const shown = only === "first" ? variants.slice(0, 1) : variants
  return (
    <section aria-label="Bench" data-part="hw-bench">
      {shown.map((variant, index) => (
        <figure key={variant.label}>
          {only !== "first" && (
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

export { Bench }
