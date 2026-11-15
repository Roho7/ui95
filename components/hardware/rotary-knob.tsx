"use client"

import "./hardware.css"
import "./rotary-knob.css"

import * as React from "react"

type RotaryKnobSize = "sm" | "md" | "lg"

type RotaryKnobVariant = "skirted" | "pointer"

type RotaryKnobCap = "red" | "amber" | "green" | "slate"

type RotaryRange = { min: number; max: number; step: number }

const SWEEP_DEGREES = 270

const DRAG_SPAN_PX = 220

const FINE_DRAG_FACTOR = 0.1

const PAGE_FRACTION = 0.1

const SCALE_MAJOR_TICKS = 11

const SCALE_MINOR_PER_MAJOR = 2

function snapToRange(value: number, { min, max, step }: RotaryRange): number {
  const stepped = Math.round((value - min) / step) * step + min
  const clamped = Math.min(max, Math.max(min, stepped))
  return Number(clamped.toFixed(10))
}

function toTurn(value: number, { min, max }: RotaryRange): number {
  const share = max > min ? (value - min) / (max - min) : 0
  return share * SWEEP_DEGREES - SWEEP_DEGREES / 2
}

function nextFromKey(key: string, value: number, range: RotaryRange): number | null {
  const page = Math.max(range.step, (range.max - range.min) * PAGE_FRACTION)
  switch (key) {
    case "ArrowUp":
    case "ArrowRight":
      return value + range.step
    case "ArrowDown":
    case "ArrowLeft":
      return value - range.step
    case "PageUp":
      return value + page
    case "PageDown":
      return value - page
    case "Home":
      return range.min
    case "End":
      return range.max
    default:
      return null
  }
}

function useRotaryInput(value: number, range: RotaryRange, setValue: (next: number) => void, disabled: boolean) {
  const ref = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<{ x: number; y: number; value: number } | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const onWheel = React.useEffectEvent((event: WheelEvent) => {
    if (disabled || event.deltaY === 0) {
      return
    }
    event.preventDefault()
    setValue(snapToRange(value - Math.sign(event.deltaY) * range.step, range))
  })

  React.useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }
    const listener = (event: WheelEvent) => onWheel(event)
    element.addEventListener("wheel", listener, { passive: false })
    return () => element.removeEventListener("wheel", listener)
  }, [])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, value }
    setIsDragging(true)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current
    if (!start) {
      return
    }
    const travel = event.clientX - start.x - (event.clientY - start.y)
    const factor = event.shiftKey ? FINE_DRAG_FACTOR : 1
    setValue(snapToRange(start.value + (travel / DRAG_SPAN_PX) * (range.max - range.min) * factor, range))
  }

  const endDrag = () => {
    drag.current = null
    setIsDragging(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const next = disabled ? null : nextFromKey(event.key, value, range)
    if (next === null) {
      return
    }
    event.preventDefault()
    setValue(snapToRange(next, range))
  }

  return {
    ref,
    isDragging,
    handlers: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onLostPointerCapture: endDrag, onKeyDown },
  }
}

function polar(radius: number, radians: number) {
  return { x: Number((Math.cos(radians) * radius).toFixed(3)), y: Number((Math.sin(radians) * radius).toFixed(3)) }
}

const SCALE_TICK_COUNT = (SCALE_MAJOR_TICKS - 1) * SCALE_MINOR_PER_MAJOR + 1

const SCALE_TICKS = Array.from({ length: SCALE_TICK_COUNT }, (_, index) => {
  const isMajor = index % SCALE_MINOR_PER_MAJOR === 0
  const radians = ((index / (SCALE_TICK_COUNT - 1)) * SWEEP_DEGREES - SWEEP_DEGREES / 2 - 90) * (Math.PI / 180)
  return {
    index,
    isMajor,
    inner: polar(36.5, radians),
    outer: polar(isMajor ? 41 : 39.5, radians),
    numeral: isMajor ? { ...polar(46, radians), text: String(index / SCALE_MINOR_PER_MAJOR) } : null,
  }
})

function KnobScale() {
  return (
    <svg aria-hidden data-part="knob-scale" viewBox="-50 -50 100 100">
      {SCALE_TICKS.map(({ index, isMajor, inner, outer, numeral }) => (
        <g key={index}>
          <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} data-major={isMajor ? "" : undefined} />
          {numeral && (
            <text x={numeral.x} y={numeral.y}>
              {numeral.text}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

const FLUTE_COUNT = 36

const POINTER_ARM_CLEARANCE_DEGREES = 40

function flutes(inner: number, outer: number, skipArm: boolean) {
  return Array.from({ length: FLUTE_COUNT }, (_, index) => (index / FLUTE_COUNT) * 360)
    .filter((degrees) => !skipArm || Math.abs(((degrees + 180) % 360) - 180) > POINTER_ARM_CLEARANCE_DEGREES)
    .map((degrees) => {
      const radians = (degrees - 90) * (Math.PI / 180)
      return { degrees, from: polar(inner, radians), to: polar(outer, radians) }
    })
}

const SKIRTED_FLUTES = flutes(30.5, 34, false)

const POINTER_FLUTES = flutes(26.5, 30, true)

const POINTER_PATH = "M -14.08 -26.49 C -10 -36 -5 -46 0 -47 C 5 -46 10 -36 14.08 -26.49 A 30 30 0 1 1 -14.08 -26.49 Z"

const CAP_FILL: Record<RotaryKnobCap, string> = {
  red: "var(--hw-red)",
  amber: "var(--hw-amber)",
  green: "var(--hw-green)",
  slate: "var(--hw-slate)",
}

function KnobFace({ variant, cap, turn }: { variant: RotaryKnobVariant; cap?: RotaryKnobCap; turn: number }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const light = `rotate(${-turn})`
  const isSkirted = variant === "skirted"
  return (
    <svg aria-hidden data-part="knob-face" viewBox="-50 -50 100 100">
      <defs>
        <radialGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" cx="-20" cy="-24" r="82" gradientTransform={light}>
          <stop offset="0" stopColor="#4d4a46" />
          <stop offset="0.42" stopColor="#2c2a28" />
          <stop offset="1" stopColor="#141312" />
        </radialGradient>
        <radialGradient id={`${id}-dish`} gradientUnits="userSpaceOnUse" cx="10" cy="12" r="34" gradientTransform={light}>
          <stop offset="0" stopColor="#3a3734" />
          <stop offset="1" stopColor="#1c1b19" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} gradientUnits="userSpaceOnUse" x1="-34" y1="-34" x2="34" y2="34" gradientTransform={light}>
          <stop offset="0" stopColor="#8f8a82" />
          <stop offset="0.5" stopColor="#2a2826" />
          <stop offset="1" stopColor="#050505" />
        </linearGradient>
        <radialGradient id={`${id}-insert`} gradientUnits="userSpaceOnUse" cx="6" cy="8" r="20" gradientTransform={light}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <g data-part="knob-turn">
        {isSkirted ? (
          <>
            <circle r="48" fill={`url(#${id}-body)`} stroke={`url(#${id}-rim)`} data-part="knob-skirt" />
            <line x1="0" y1="-46.5" x2="0" y2="-38" data-part="knob-index" />
            <circle r="34" fill={`url(#${id}-body)`} stroke={`url(#${id}-rim)`} data-part="knob-cap" />
            {SKIRTED_FLUTES.map(({ degrees, from, to }) => (
              <line key={degrees} x1={from.x} y1={from.y} x2={to.x} y2={to.y} data-part="knob-flute" />
            ))}
            <circle r="27" fill={`url(#${id}-dish)`} data-part="knob-dish" />
          </>
        ) : (
          <>
            <path d={POINTER_PATH} fill={`url(#${id}-body)`} stroke={`url(#${id}-rim)`} data-part="knob-cap" />
            {POINTER_FLUTES.map(({ degrees, from, to }) => (
              <line key={degrees} x1={from.x} y1={from.y} x2={to.x} y2={to.y} data-part="knob-flute" />
            ))}
            <circle r="21" fill={`url(#${id}-dish)`} data-part="knob-dish" />
          </>
        )}
        {cap && (
          <>
            <circle r={isSkirted ? 17 : 13} style={{ fill: CAP_FILL[cap] }} />
            <circle r={isSkirted ? 17 : 13} fill={`url(#${id}-insert)`} />
          </>
        )}
        <line x1="0" y1={isSkirted ? -9 : -12} x2="0" y2={isSkirted ? -30 : -43} data-part="knob-index" />
      </g>
    </svg>
  )
}

type RotaryKnobProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  label: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  size?: RotaryKnobSize
  variant?: RotaryKnobVariant
  cap?: RotaryKnobCap
  disabled?: boolean
}

function RotaryKnob({
  label,
  value: controlled,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  size = "md",
  variant = "skirted",
  cap,
  disabled = false,
  ...props
}: RotaryKnobProps) {
  const range = { min, max, step }
  const [stored, setStored] = React.useState(() => snapToRange(defaultValue ?? min, range))
  const value = controlled ?? stored
  const setValue = (next: number) => {
    if (next === value) {
      return
    }
    setStored(next)
    onValueChange?.(next)
  }
  const { ref, isDragging, handlers } = useRotaryInput(value, range, setValue, disabled)
  const turn = toTurn(value, range)

  return (
    <div data-hw="" data-part="knob" data-size={size} data-variant={variant} {...props}>
      <div data-part="knob-mount">
        <KnobScale />
        <div
          ref={ref}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled || undefined}
          data-slot="rotary-knob"
          data-part="knob-body"
          data-dragging={isDragging ? "" : undefined}
          style={{ "--hw-turn": `${turn}deg` } as React.CSSProperties}
          {...handlers}
        >
          <KnobFace variant={variant} cap={cap} turn={turn} />
        </div>
      </div>
      <span data-part="legend">{label}</span>
    </div>
  )
}

export { RotaryKnob, type RotaryKnobCap, type RotaryKnobSize, type RotaryKnobVariant }
