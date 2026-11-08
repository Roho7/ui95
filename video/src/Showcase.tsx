import { Audio } from "@remotion/media"
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion"

import { Camera } from "./Camera"
import { CrtLayer } from "./CrtLayer"
import { DesktopShot, PowerShot } from "./shots/Desktop"
import { DraggedWindow, WIDGETS } from "./shots/Shots"
import { WIZARD_CLICK_AT, WIZARD_RELEASE, WizardShot } from "./shots/Wizard"
import { ThemeSync } from "./ThemeSync"
import { CRT_ON_AT, type Cut, readDragLength, SHOT_CUES, SHOTS, type SoundCue, TOTAL_FRAMES, WIZARD_AT, WIZARD_LENGTH } from "./timeline"
import { BentoWorld } from "./worlds/BentoWorld"
import { DESKTOP_SLOTS, DesktopDialog, DesktopWorld } from "./worlds/DesktopWorld"

export type ShowcaseProps = {
  installCommand: string
  roomToneVolume: number
  crtBuzzVolume: number
}

const VARIANTS = 6

function ShotView({ cut }: { cut: Cut }) {
  if (cut.kind === "desktop") {
    return <DesktopShot cut={cut} />
  }
  if (cut.kind === "power") {
    return <PowerShot cut={cut} />
  }
  const camera = { zoom: cut.zoom, anchor: cut.anchor, move: cut.move, duration: cut.duration, actionAt: cut.actionAt }
  if (cut.kind === "window-drag") {
    return (
      <Camera {...camera}>
        <DesktopWorld>
          <DraggedWindow cut={cut} />
        </DesktopWorld>
      </Camera>
    )
  }
  const { Widget, entry, title } = WIDGETS[cut.kind]
  if (cut.world === "desktop") {
    return (
      <Camera {...camera}>
        <DesktopWorld>
          <DesktopDialog title={title} slot={DESKTOP_SLOTS[cut.variant % DESKTOP_SLOTS.length]} width={cut.kind === "terminal" ? 560 : 380}>
            <Widget cut={cut} />
          </DesktopDialog>
        </DesktopWorld>
      </Camera>
    )
  }
  return (
    <Camera {...camera}>
      <BentoWorld entryName={entry} render={() => <Widget cut={cut} />} />
    </Camera>
  )
}

function wizardCues(): SoundCue[] {
  const clickAt = WIZARD_AT + WIZARD_CLICK_AT
  return [
    { at: WIZARD_AT, key: "button.release", volume: 1 },
    { at: clickAt, key: "keycap.press", volume: 1 },
    { at: clickAt + WIZARD_RELEASE, key: "keycap.release", volume: 1 },
  ]
}

function CrtBuzz({ volume }: { volume: number }) {
  const frame = useCurrentFrame()
  return (
    <Audio
      src={staticFile("sfx/crt-buzz.wav")}
      volume={volume * interpolate(frame, [0, 20, WIZARD_AT - CRT_ON_AT - 2, WIZARD_AT - CRT_ON_AT], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
    />
  )
}

function RoomTone({ volume }: { volume: number }) {
  const frame = useCurrentFrame()
  return (
    <Audio
      src={staticFile("sfx/room-tone.wav")}
      volume={volume * interpolate(frame, [0, 12, TOTAL_FRAMES - 30, TOTAL_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
    />
  )
}

export function Showcase({ installCommand, roomToneVolume, crtBuzzVolume }: ShowcaseProps) {
  const cues = [...SHOT_CUES, ...wizardCues()]
  const beforeCrt = SHOTS.filter((cut) => cut.from < CRT_ON_AT)
  const afterCrt = SHOTS.filter((cut) => cut.from >= CRT_ON_AT)

  return (
    <AbsoluteFill className="bg-black">
      <ThemeSync />
      {beforeCrt.map((cut) => (
        <Sequence key={cut.from} name={`${cut.kind} ${cut.from}`} from={cut.from} durationInFrames={cut.duration}>
          <ShotView cut={cut} />
        </Sequence>
      ))}
      <Sequence name="CRT" from={CRT_ON_AT} durationInFrames={WIZARD_AT - CRT_ON_AT}>
        <CrtLayer>
          {afterCrt.map((cut) => (
            <Sequence key={cut.from} name={`${cut.kind} ${cut.from}`} from={cut.from - CRT_ON_AT} durationInFrames={cut.duration}>
              <ShotView cut={cut} />
            </Sequence>
          ))}
        </CrtLayer>
      </Sequence>
      <Sequence name="Install" from={WIZARD_AT} durationInFrames={WIZARD_LENGTH}>
        <WizardShot command={installCommand} duration={WIZARD_LENGTH} />
      </Sequence>

      <Sequence name="Room tone" layout="none">
        <RoomTone volume={roomToneVolume} />
      </Sequence>
      <Sequence name="CRT power on" from={CRT_ON_AT - 2} layout="none">
        <Audio src={staticFile("sfx/crt-on.wav")} volume={0.9} />
      </Sequence>
      <Sequence name="CRT buzz" from={CRT_ON_AT} durationInFrames={WIZARD_AT - CRT_ON_AT} layout="none">
        <CrtBuzz volume={crtBuzzVolume} />
      </Sequence>
      {SHOTS.filter((cut) => cut.kind === "window-drag").map((cut) => (
        <Audio
          key={`friction-${cut.from}`}
          name="drag friction"
          from={cut.from + cut.actionAt}
          durationInFrames={readDragLength(cut)}
          src={staticFile("sfx/drag-friction.wav")}
          volume={(frame) => 0.18 * Math.sin(Math.PI * Math.min(1, frame / readDragLength(cut)))}
        />
      ))}
      {cues.map((cue, index) => (
        <Audio
          key={`${cue.at}-${cue.key}-${index}`}
          name={cue.key}
          from={cue.at}
          src={staticFile(`sfx/${cue.key}-${(cue.at * 7 + index) % VARIANTS}.wav`)}
          volume={cue.volume}
        />
      ))}
    </AbsoluteFill>
  )
}
