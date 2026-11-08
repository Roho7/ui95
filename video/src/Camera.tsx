import React from "react"
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion"

import { Cursor } from "./Cursor"
import type { Anchor, CameraMove } from "./timeline"

export const STAGE_WIDTH = 1920
export const STAGE_HEIGHT = 1080

const LATE_MEASURE_MS = 300

type Point = { x: number; y: number }

const ANCHORS: Record<Anchor, Point> = {
  center: { x: 960, y: 540 },
  left: { x: 640, y: 540 },
  right: { x: 1280, y: 540 },
  "top-left": { x: 700, y: 400 },
  "top-right": { x: 1220, y: 400 },
  "bottom-left": { x: 700, y: 680 },
  "bottom-right": { x: 1220, y: 680 },
}

function readZoom(move: CameraMove, zoom: number, frame: number, duration: number, actionAt: number): number {
  if (move === "push") {
    return zoom * interpolate(frame, [0, duration], [1, 1.18], { extrapolateRight: "clamp" })
  }
  if (move === "pull") {
    return interpolate(frame, [0, duration], [zoom * 1.6, zoom], {
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    })
  }
  if (move === "snap") {
    return frame >= actionAt ? zoom * 2 : zoom
  }
  return zoom
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function samePoint(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5
}

type PointerState = Point & { isPressed: boolean }

function samePointer(a: PointerState | null, b: PointerState | null): boolean {
  return a === b || (a !== null && b !== null && samePoint(a, b) && a.isPressed === b.isPressed)
}

function readPointer(element: HTMLElement | null, stageRect: DOMRect, unit: number): PointerState | null {
  if (!element) {
    return null
  }
  const rect = element.getBoundingClientRect()
  const { cursorX, cursorY, cursorDx, cursorDy } = element.dataset
  return {
    x: (rect.left - stageRect.left) / unit + (rect.width / unit) * Number(cursorX ?? 0.5) + Number(cursorDx ?? 0),
    y: (rect.top - stageRect.top) / unit + (rect.height / unit) * Number(cursorY ?? 0.5) + Number(cursorDy ?? 0),
    isPressed: element.dataset.cursorPressed !== undefined,
  }
}

export type CameraCursor = { offsetX: number; offsetY: number; isPressed: boolean }

type CameraProps = {
  zoom: number
  anchor: Anchor
  move: CameraMove
  duration: number
  actionAt: number
  focusSelector?: string
  focusIndex?: number
  cursor?: CameraCursor
  children: React.ReactNode
}

export function Camera({ zoom, anchor, move, duration, actionAt, focusSelector = "[data-focus]", focusIndex = 0, cursor, children }: CameraProps) {
  const frame = useCurrentFrame()
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [focus, setFocus] = React.useState<Point>({ x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 })
  const [pointer, setPointer] = React.useState<PointerState | null>(null)
  const scale = readZoom(move, zoom, frame, duration, actionAt)

  const measure = React.useCallback(() => {
    const stage = stageRef.current
    const target = stage?.querySelectorAll<HTMLElement>(focusSelector)[focusIndex]
    if (!stage || !target) {
      return
    }
    const stageRect = stage.getBoundingClientRect()
    const unit = stageRect.width / STAGE_WIDTH
    if (unit === 0) {
      return
    }
    const targetRect = target.getBoundingClientRect()
    const next = {
      x: (targetRect.left + targetRect.width / 2 - stageRect.left) / unit,
      y: (targetRect.top + targetRect.height / 2 - stageRect.top) / unit,
    }
    setFocus((previous) => (samePoint(previous, next) ? previous : next))
    const nextPointer = readPointer(stage.querySelector<HTMLElement>("[data-cursor]"), stageRect, unit)
    setPointer((previous) => (samePointer(previous, nextPointer) ? previous : nextPointer))
  }, [focusSelector, focusIndex])

  React.useLayoutEffect(measure)

  React.useEffect(() => {
    const timeout = window.setTimeout(measure, LATE_MEASURE_MS)
    void document.fonts.ready.then(measure)
    return () => window.clearTimeout(timeout)
  }, [measure])

  const screen = ANCHORS[anchor]
  const left = clamp(screen.x - focus.x * scale, STAGE_WIDTH * (1 - scale), 0)
  const top = clamp(screen.y - focus.y * scale, STAGE_HEIGHT * (1 - scale), 0)

  return (
    <AbsoluteFill className="bg-desktop" style={{ overflow: "hidden" }}>
      <div
        ref={stageRef}
        className="bg-desktop text-foreground"
        style={{
          position: "absolute",
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          left: 0,
          top: 0,
          overflow: "hidden",
          transformOrigin: "0 0",
          transform: `translate(${left}px, ${top}px) scale(${scale})`,
        }}
      >
        {children}
        {cursor && <Cursor x={focus.x + cursor.offsetX} y={focus.y + cursor.offsetY} isPressed={cursor.isPressed} />}
        {!cursor && pointer && <Cursor x={pointer.x} y={pointer.y} isPressed={pointer.isPressed} />}
      </div>
    </AbsoluteFill>
  )
}
