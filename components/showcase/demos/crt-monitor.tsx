"use client"

import { CrtMonitor } from "@/components/hardware/crt-monitor"

import type { ShowcaseDemo } from "../types"

function PhosphorScreen() {
  return (
    <div className="flex size-full flex-col justify-center gap-2 bg-[#0c1a10] px-10 font-mono text-2xl text-[#9df5b0]">
      <p>HARDWARE95 MONITOR CM-1</p>
      <p>MEMORY TEST 640K OK</p>
      <p>READY.</p>
    </div>
  )
}

export const demo: ShowcaseDemo = {
  span: "full",
  variants: [
    { label: "on", render: () => <CrtMonitor><PhosphorScreen /></CrtMonitor> },
    { label: "off", render: () => <CrtMonitor defaultOn={false}><PhosphorScreen /></CrtMonitor> },
  ],
}
