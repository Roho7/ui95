import { Easing, interpolate, useCurrentFrame } from "remotion"

import { Camera } from "../Camera"
import type { Cut } from "../timeline"
import { DesktopWorld } from "../worlds/DesktopWorld"

const CRT_SWITCH = 'section[aria-label="Control Panel"] [data-slot="switch"]'
const CRT_SWITCH_INDEX = 1

export function DesktopShot({ cut }: { cut: Cut }) {
  const frame = useCurrentFrame()
  const hasCursor = cut.variant === 0
  const travel = interpolate(frame, [6, cut.duration], [1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  })
  return (
    <Camera
      zoom={cut.zoom}
      anchor={cut.anchor}
      move={cut.move}
      duration={cut.duration}
      actionAt={cut.actionAt}
      focusSelector={CRT_SWITCH}
      focusIndex={CRT_SWITCH_INDEX}
      cursor={hasCursor ? { offsetX: travel * 420, offsetY: travel * 240, isPressed: frame < 5 } : undefined}
    >
      <DesktopWorld />
    </Camera>
  )
}

export function PowerShot({ cut }: { cut: Cut }) {
  const frame = useCurrentFrame()
  const approach = interpolate(frame, [0, cut.actionAt - 4], [1, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.8, 0.3, 1),
  })
  const isPressed = frame >= cut.actionAt && frame < cut.actionAt + 6
  return (
    <Camera
      zoom={cut.zoom}
      anchor={cut.anchor}
      move={cut.move}
      duration={cut.duration}
      actionAt={cut.actionAt}
      focusSelector={CRT_SWITCH}
      focusIndex={CRT_SWITCH_INDEX}
      cursor={{ offsetX: 4 + approach * 90, offsetY: 2 + approach * 50, isPressed }}
    >
      <DesktopWorld />
    </Camera>
  )
}
