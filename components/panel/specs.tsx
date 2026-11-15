"use client"

import type * as React from "react"

import { RotaryKnob } from "@/components/hardware/rotary-knob"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { PanelControlHints, PanelValue } from "@/lib/panel/controls"

export type PanelSpec = PanelControlHints & {
  component: React.ComponentType<Record<string, unknown>>
  base?: Record<string, PanelValue>
  children?: React.ReactNode
  valueProp?: { value: string; onChange: string; initial: number }
}

export const PANEL_SPECS: Partial<Record<string, PanelSpec>> = {
  "rotary-knob": {
    component: RotaryKnob as React.ComponentType<Record<string, unknown>>,
    text: { label: "Volume" },
    ranges: { min: { min: 0, max: 10, step: 1 }, max: { min: 10, max: 200, step: 10 }, step: { min: 1, max: 10, step: 1 } },
    hide: ["value"],
    valueProp: { value: "value", onChange: "onValueChange", initial: 62 },
  },
  button: { component: Button as React.ComponentType<Record<string, unknown>>, children: "Press me" },
  badge: { component: Badge as React.ComponentType<Record<string, unknown>>, children: "Online" },
  switch: { component: Switch as React.ComponentType<Record<string, unknown>>, base: { "aria-label": "Power" } },
}
