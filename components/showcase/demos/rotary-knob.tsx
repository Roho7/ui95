"use client"

import * as React from "react"

import { Faceplate, Legend } from "@/components/hardware/faceplate"
import { Lamp } from "@/components/hardware/lamp"
import { RotaryKnob } from "@/components/hardware/rotary-knob"

import type { ShowcaseDemo } from "../types"

function AmpSection() {
  const [volume, setVolume] = React.useState(62)
  return (
    <Faceplate>
      <div className="flex flex-col gap-3">
        <Legend size="lg">Output</Legend>
        <div className="flex items-center gap-6">
          <RotaryKnob label="Volume" value={volume} onValueChange={setVolume} size="lg" />
          <RotaryKnob label="Bass" defaultValue={45} />
          <RotaryKnob label="Treble" defaultValue={70} />
          <Lamp on={volume >= 90} label="Clip" />
        </div>
      </div>
    </Faceplate>
  )
}

export const demo: ShowcaseDemo = {
  span: "full",
  variants: [
    { label: "skirted on putty", render: () => <AmpSection /> },
    {
      label: "pointer on khaki",
      render: () => (
        <Faceplate finish="khaki">
          <div className="flex items-center gap-6">
            <RotaryKnob label="Fine" variant="pointer" size="sm" defaultValue={30} />
            <RotaryKnob label="Gain" variant="pointer" defaultValue={50} />
            <RotaryKnob label="Master" variant="pointer" size="lg" defaultValue={80} />
          </div>
        </Faceplate>
      ),
    },
    {
      label: "coloured caps, stepped and disabled on cream",
      render: () => (
        <Faceplate finish="cream">
          <div className="flex items-center gap-6">
            <RotaryKnob label="Tone" min={0} max={10} step={1} defaultValue={4} cap="red" />
            <RotaryKnob label="Focus" defaultValue={55} cap="green" />
            <RotaryKnob label="Intensity" defaultValue={35} cap="amber" />
            <RotaryKnob label="Locked" defaultValue={20} disabled />
          </div>
        </Faceplate>
      ),
    },
  ],
}
