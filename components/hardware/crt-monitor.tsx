"use client"

import "./hardware.css"
import "./crt-monitor.css"

import * as React from "react"

import { CrtScreen } from "@/components/retro/crt-screen"

import { Legend } from "./faceplate"
import { Lamp } from "./lamp"

type CrtMonitorProps = Omit<React.ComponentProps<"div">, "children"> & {
  children: React.ReactNode
  on?: boolean
  defaultOn?: boolean
  onPowerChange?: (on: boolean) => void
  brightness?: number
  curvature?: number
  model?: string
  controls?: React.ReactNode
}

function CrtMonitor({
  children,
  on: controlled,
  defaultOn = true,
  onPowerChange,
  brightness = 1,
  curvature = 0.08,
  model = "Hardware95 · CM-1",
  controls,
  style,
  ...props
}: CrtMonitorProps) {
  const [stored, setStored] = React.useState(defaultOn)
  const isOn = controlled ?? stored
  const toggle = () => {
    setStored(!isOn)
    onPowerChange?.(!isOn)
  }
  const screenStyle = { ...style, "--hw-brightness": String(brightness) } as React.CSSProperties

  return (
    <div data-hw="" data-part="monitor" data-on={isOn ? "" : undefined} style={screenStyle} {...props}>
      <div data-part="monitor-bezel">
        <div data-part="monitor-screen">
          {isOn && (
            <div data-part="monitor-raster">
              <CrtScreen className="size-full" preset="subtle" curvature={curvature}>
                {children}
              </CrtScreen>
            </div>
          )}
          <span aria-hidden data-part="monitor-glass" />
        </div>
      </div>
      <div data-part="monitor-chin">
        <Legend size="sm">{model}</Legend>
        <span aria-hidden data-part="monitor-vents" />
        {controls && <div data-part="monitor-controls">{controls}</div>}
        <div data-part="monitor-power">
          <Lamp on={isOn} tone="green" />
          <button type="button" data-part="monitor-power-key" data-slot="button" aria-pressed={isOn} onClick={toggle}>
            <Legend size="sm">Power</Legend>
          </button>
        </div>
      </div>
    </div>
  )
}

export { CrtMonitor }
