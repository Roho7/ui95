import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion"

import { BrandLogo } from "@/app/_site/LogoGlyph"
import { Window } from "@/components/retro/window"
import { CopyCommand } from "@/components/showcase/CopyCommand"
import { CtaButton } from "@/components/ui/cta-button"
import { Plate } from "@/components/ui/plate"
import { REGISTRY_DOCS } from "@/lib/docs/registry-docs"

import { Camera } from "../Camera"
import { useShaderSettle } from "../CrtLayer"
import { Target } from "../Target"
import { DesktopWorld } from "../worlds/DesktopWorld"

export const WIZARD_CLICK_AT = 72
export const WIZARD_RELEASE = 6

const WINDOW_LEFT = 420
const WINDOW_TOP = 36
const WINDOW_WIDTH = 720

export function WizardShot({ command, duration }: { command: string; duration: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  useShaderSettle(frame)
  const clickAt = WIZARD_CLICK_AT
  const isPressed = frame >= clickAt && frame < clickAt + WIZARD_RELEASE
  const cursorTravel = interpolate(frame, [8, clickAt - 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  })
  const zoom = interpolate(frame, [0, clickAt, duration], [1.3, 1.85, 1.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  })

  return (
    <Camera zoom={zoom} anchor="center" move="static" duration={duration} actionAt={0} focusSelector="[data-install-window]">
      <DesktopWorld>
        <div data-install-window="" className="absolute" style={{ left: WINDOW_LEFT, top: WINDOW_TOP, width: WINDOW_WIDTH }}>
          <Window
            title="Install.exe"
            onMinimize={() => {}}
            onMaximize={() => {}}
            onClose={() => {}}
            statusBar={
              <>
                <span>UI95.dev</span>
                <span className="ml-auto">{REGISTRY_DOCS.length} items in the registry</span>
              </>
            }
          >
            <div className="flex flex-col gap-4 p-5">
              <Plate variant="sunken">
                <h1 className="flex items-baseline font-pixel text-[56px] leading-tight uppercase">
                  UI
                  <BrandLogo className="mr-4 h-[35px]" />
                </h1>
              </Plate>
              <p className="text-2xl leading-tight">Retro Win95 style components for Shadcn.</p>
              <CopyCommand command={command} label="install command for theme" />
              <div className="flex justify-end">
                <Target cursorX={0.35} cursorY={0.55} offsetX={cursorTravel * 320} offsetY={cursorTravel * 160} isPressed={isPressed}>
                  <CtaButton size="lg" data-force-active={isPressed ? "" : undefined} shine={{ speed: 0, fps, frame: (frame / fps) * 1000 }}>
                    Install
                  </CtaButton>
                </Target>
              </div>
            </div>
          </Window>
        </div>
      </DesktopWorld>
    </Camera>
  )
}
