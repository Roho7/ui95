import "./hardware.css"

import * as React from "react"

type LampTone = "red" | "amber" | "green"

type LampProps = Omit<React.ComponentProps<"span">, "children"> & {
  on?: boolean
  tone?: LampTone
  label?: string
}

function Lamp({ on = false, tone = "red", label, ...props }: LampProps) {
  const state = on ? "on" : "off"
  return (
    <span data-hw="" data-part="lamp" data-tone={tone} data-on={on ? "" : undefined} role="img" aria-label={label ? `${label} ${state}` : state} {...props}>
      <span aria-hidden data-part="lamp-bezel">
        <span data-part="lamp-lens" />
      </span>
      {label && (
        <span aria-hidden data-part="legend" data-size="sm">
          {label}
        </span>
      )}
    </span>
  )
}

export { Lamp, type LampTone }
