import "./hardware.css"

import * as React from "react"

type FaceplateFinish = "putty" | "cream" | "khaki"

type LegendSize = "sm" | "md" | "lg"

const SCREW_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const

type FaceplateProps = React.ComponentProps<"div"> & {
  finish?: FaceplateFinish
  screws?: boolean
}

function Faceplate({ finish = "putty", screws = true, children, ...props }: FaceplateProps) {
  return (
    <div data-hw="" data-part="faceplate" data-finish={finish} {...props}>
      {screws && SCREW_CORNERS.map((corner) => <span key={corner} aria-hidden data-part="screw" data-corner={corner} />)}
      {children}
    </div>
  )
}

type LegendProps = React.ComponentProps<"span"> & {
  size?: LegendSize
}

function Legend({ size = "md", ...props }: LegendProps) {
  return <span data-part="legend" data-size={size} {...props} />
}

export { Faceplate, type FaceplateFinish, Legend, type LegendSize }
