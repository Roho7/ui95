import { Faceplate, type FaceplateFinish, Legend } from "@/components/hardware/faceplate"
import { Lamp } from "@/components/hardware/lamp"

import type { ShowcaseDemo } from "../types"

const FINISHES: readonly FaceplateFinish[] = ["putty", "cream", "khaki"]

function PilotPanel({ finish }: { finish: FaceplateFinish }) {
  return (
    <Faceplate finish={finish}>
      <div className="flex flex-col gap-5">
        <div className="flex items-baseline gap-3">
          <Legend size="lg">Hardware95</Legend>
          <Legend size="sm">Model HW-1 · Pilot lamps</Legend>
        </div>
        <div className="flex items-end gap-8">
          <Lamp on label="Power" />
          <Lamp on tone="amber" label="Simulation on" />
          <Lamp tone="amber" label="Standby" />
          <Lamp on tone="green" label="Signal" />
          <Lamp tone="green" label="Sync" />
          <Lamp label="Fault" />
        </div>
      </div>
    </Faceplate>
  )
}

export const demo: ShowcaseDemo = {
  span: "full",
  variants: FINISHES.map((finish) => ({ label: finish, render: () => <PilotPanel finish={finish} /> })),
}
