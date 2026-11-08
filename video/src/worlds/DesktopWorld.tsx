import { Desktop } from "@/app/_demo/Desktop"
import { Window } from "@/components/retro/window"
import { REGISTRY_DOCS } from "@/lib/docs/registry-docs"

import { useSettleOnMount } from "./useSettle"

export type Slot = { x: number; y: number }

export const DESKTOP_SLOTS: readonly Slot[] = [
  { x: 560, y: 330 },
  { x: 900, y: 230 },
  { x: 420, y: 560 },
  { x: 1040, y: 470 },
]

export function DesktopWorld({ children }: { children?: React.ReactNode }) {
  useSettleOnMount("Desktop wallpaper")
  return (
    <div data-world="desktop" className="absolute inset-0">
      <Desktop itemCount={REGISTRY_DOCS.length} />
      <div className="absolute inset-0" style={{ zIndex: 25 }}>
        {children}
      </div>
    </div>
  )
}

type DesktopDialogProps = {
  title: string
  slot: Slot
  width?: number
  children: React.ReactNode
}

export function DesktopDialog({ title, slot, width = 380, children }: DesktopDialogProps) {
  return (
    <div className="absolute" style={{ left: slot.x, top: slot.y }}>
      <Window title={title} onClose={() => {}} style={{ width }}>
        <div className="flex flex-col gap-4 p-5 text-lg">{children}</div>
      </Window>
    </div>
  )
}
