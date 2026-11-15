"use client"

import "./machine.css"

import Link from "next/link"
import { useEffect, useReducer, useRef, useState } from "react"

import { Desktop } from "@/app/_demo/Desktop"
import { CrtMonitor } from "@/components/hardware/crt-monitor"
import { Legend } from "@/components/hardware/faceplate"
import { Lamp } from "@/components/hardware/lamp"
import { RotaryKnob } from "@/components/hardware/rotary-knob"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { SOURCE_URL } from "@/lib/site"

type MachineState = "off" | "warming" | "booting" | "on"

type MachineEvent = { type: "power"; isInstant: boolean } | { type: "advance" }

const NEXT_STATE: Record<MachineState, MachineState> = { off: "off", warming: "booting", booting: "on", on: "on" }

const STATE_MS: Partial<Record<MachineState, number>> = { warming: 600, booting: 1500 }

const BOOT_LINES = ["HARDWARE95 BIOS 1.0", "MEMORY TEST 640K OK", "CRT MONITOR CM-1 OK", "LOADING UI95..."]

const STAGE = { width: 1280, height: 960 }

function reduce(state: MachineState, event: MachineEvent): MachineState {
  if (event.type === "power") {
    return state !== "off" ? "off" : event.isInstant ? "on" : "warming"
  }
  return NEXT_STATE[state]
}

function useStageScale() {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / STAGE.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { ref, scale }
}

function Screen({ state, itemCount }: { state: MachineState; itemCount: number }) {
  const { ref, scale } = useStageScale()
  if (state === "on") {
    return (
      <div ref={ref} data-part="machine-stage-frame">
        <div data-part="machine-stage" style={{ width: STAGE.width, height: STAGE.height, transform: `scale(${scale})` }}>
          <Desktop itemCount={itemCount} className="h-full" />
        </div>
      </div>
    )
  }
  return (
    <div ref={ref} data-part="machine-boot" data-state={state}>
      {state === "booting" && BOOT_LINES.map((line, index) => <p key={line} style={{ animationDelay: `${index * 320}ms` }}>{line}</p>)}
    </div>
  )
}

const KNOB_RANGE = { brightness: [0.4, 1.4], curvature: [0, 0.2] } as const

function fromKnob(value: number, [low, high]: readonly [number, number]): number {
  return low + (value / 100) * (high - low)
}

function Machine({ itemCount }: { itemCount: number }) {
  const isReducedMotion = usePrefersReducedMotion()
  const [state, dispatch] = useReducer(reduce, "off")
  const [brightness, setBrightness] = useState(60)
  const [curvature, setCurvature] = useState(40)

  useEffect(() => {
    const delay = STATE_MS[state]
    if (delay === undefined) {
      return
    }
    const timer = window.setTimeout(() => dispatch({ type: "advance" }), delay)
    return () => window.clearTimeout(timer)
  }, [state])

  return (
    <div data-hw="" data-part="machine-site" data-state={state}>
      <header data-part="machine-header">
        <Legend size="lg">Hardware95 · UI95 system</Legend>
        <nav aria-label="Site">
          <Link href="/docs">Manual</Link>
          <a href={SOURCE_URL}>GitHub</a>
        </nav>
      </header>
      <section data-part="machine-desk" aria-label="The machine">
        <CrtMonitor
          on={state !== "off"}
          onPowerChange={() => dispatch({ type: "power", isInstant: isReducedMotion })}
          brightness={fromKnob(brightness, KNOB_RANGE.brightness)}
          curvature={fromKnob(curvature, KNOB_RANGE.curvature)}
          model="Hardware95 · CM-1"
          controls={
            <>
              <RotaryKnob label="Bright" size="sm" variant="pointer" value={brightness} onValueChange={setBrightness} />
              <RotaryKnob label="Curve" size="sm" variant="pointer" value={curvature} onValueChange={setCurvature} />
            </>
          }
        >
          <Screen state={state} itemCount={itemCount} />
        </CrtMonitor>
        {state === "off" && (
          <p data-part="machine-hint">
            <Lamp on tone="amber" /> Press power to boot the machine
          </p>
        )}
      </section>
      <nav aria-label="Libraries" data-part="machine-doors">
        <Link href="/ui" data-part="machine-door">
          <span data-part="machine-door-key">
            <Legend>Software · UI95</Legend>
          </span>
          <span>Win95 components for shadcn</span>
          <code>npx shadcn add @ui95/window</code>
        </Link>
        <Link href="/hardware" data-part="machine-door">
          <span data-part="machine-door-key">
            <Legend>Hardware · Hardware95</Legend>
          </span>
          <span>Knobs, lamps, monitors, switches</span>
          <code>npx shadcn add @ui95/rotary-knob</code>
        </Link>
      </nav>
    </div>
  )
}

export { Machine }
