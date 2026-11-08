export type Theme = "phosphor" | "95" | "cyan-pixel" | "retro-candy" | "soul-green"

export type ShotKind =
  | "button"
  | "cta"
  | "checkbox"
  | "switch"
  | "toggle"
  | "radio"
  | "tabs"
  | "keycap"
  | "taskbar"
  | "slider"
  | "type"
  | "terminal"
  | "window-drag"
  | "progress"
  | "menu"
  | "desktop"
  | "power"

export type Anchor = "center" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right"

export type CameraMove = "static" | "push" | "snap" | "pull"

export type World = "desktop" | "bento"

const DESKTOP_KINDS: ShotKind[] = ["desktop", "power", "terminal", "window-drag"]

const BENTO_ONLY_KINDS: ShotKind[] = ["cta", "taskbar"]

export type Cut = {
  world: World
  from: number
  duration: number
  kind: ShotKind
  theme: Theme
  dark: boolean
  zoom: number
  anchor: Anchor
  move: CameraMove
  actionAt: number
  variant: number
  text: string
}

export type SoundCue = { at: number; key: string; volume: number }

export const FPS = 60

export const TYPING_CADENCE = 4

const ANCHOR_CYCLE: Anchor[] = ["center", "top-left", "right", "bottom-left", "center", "top-right", "left", "bottom-right"]

const ZOOM_CYCLE = [4, 7, 2, 5, 3, 8, 4, 2, 6, 3]

type CutSpec = Partial<Omit<Cut, "from">> & Pick<Cut, "duration" | "kind">

function buildCuts(specs: CutSpec[]): Cut[] {
  let from = 0
  return specs.map((spec, index) => {
    const cut: Cut = {
      world: DESKTOP_KINDS.includes(spec.kind) || (index % 3 === 2 && !BENTO_ONLY_KINDS.includes(spec.kind)) ? "desktop" : "bento",
      theme: "95",
      dark: false,
      zoom: ZOOM_CYCLE[index % ZOOM_CYCLE.length],
      anchor: ANCHOR_CYCLE[index % ANCHOR_CYCLE.length],
      move: "static",
      actionAt: 0,
      variant: index,
      text: "",
      ...spec,
      from,
    }
    from += spec.duration
    return cut
  })
}

const CLICK_KINDS: ShotKind[] = ["cta", "checkbox", "keycap", "switch", "taskbar", "radio", "button", "tabs", "toggle"]

function accelerate(count: number, longest: number, shortest: number): number[] {
  const ratio = Math.pow(shortest / longest, 1 / (count - 1))
  return Array.from({ length: count }, (_, index) => Math.max(shortest, Math.round(longest * Math.pow(ratio, index))))
}

const opening: CutSpec[] = accelerate(20, 20, 3).map((duration, index) => ({
  duration,
  kind: CLICK_KINDS[index % CLICK_KINDS.length],
}))

const breath: CutSpec[] = [
  { duration: 6, kind: "checkbox", zoom: 7, anchor: "center" },
  { duration: 10, kind: "radio", zoom: 4, anchor: "left" },
  { duration: 16, kind: "cta", zoom: 5, anchor: "top-right", actionAt: 2 },
  { duration: 26, kind: "switch", zoom: 3, anchor: "bottom-left", actionAt: 4 },
  { duration: 44, kind: "tabs", zoom: 2, anchor: "center", move: "push", actionAt: 8 },
  { duration: 84, kind: "desktop", zoom: 1.4, anchor: "center", move: "push", actionAt: 0 },
  { duration: 46, kind: "power", zoom: 7, anchor: "center", move: "static", actionAt: 30 },
]

export const POWER_ON_LENGTH = 70

const boot: CutSpec[] = [{ duration: POWER_ON_LENGTH, kind: "desktop", zoom: 1.5, anchor: "center", move: "pull", actionAt: 999, variant: 1 }]

const THEMES: Theme[] = ["soul-green", "retro-candy", "cyan-pixel", "95", "phosphor"]

const montageSpecs: CutSpec[] = [
  { duration: 12, kind: "cta", zoom: 5, anchor: "center" },
  { duration: 10, kind: "checkbox", zoom: 3, anchor: "top-left" },
  { duration: 66, kind: "type", zoom: 3, anchor: "left", move: "push", actionAt: 4, text: "defrag c: /now" },
  { duration: 10, kind: "keycap", zoom: 8, anchor: "center" },
  { duration: 8, kind: "toggle", zoom: 4, anchor: "bottom-right" },
  { duration: 48, kind: "slider", zoom: 4, anchor: "center", actionAt: 4 },
  { duration: 9, kind: "radio", zoom: 6, anchor: "right" },
  { duration: 8, kind: "switch", zoom: 8, anchor: "center" },
  { duration: 54, kind: "window-drag", zoom: 2, anchor: "center", actionAt: 6 },
  { duration: 10, kind: "tabs", zoom: 5, anchor: "top-left" },
  { duration: 76, kind: "terminal", zoom: 3, anchor: "left", move: "push", actionAt: 4, text: "format a:" },
  { duration: 8, kind: "taskbar", zoom: 5, anchor: "bottom-left" },
  { duration: 7, kind: "button", zoom: 4, anchor: "top-right" },
  { duration: 40, kind: "menu", zoom: 3, anchor: "right", actionAt: 2 },
  { duration: 7, kind: "checkbox", zoom: 8, anchor: "center" },
  { duration: 44, kind: "progress", zoom: 3, anchor: "center", move: "push", actionAt: 2 },
  { duration: 7, kind: "keycap", zoom: 6, anchor: "left" },
  { duration: 46, kind: "type", zoom: 5, anchor: "right", actionAt: 2, text: "hello.exe", variant: 1 },
  { duration: 6, kind: "radio", zoom: 3, anchor: "top-left" },
  { duration: 36, kind: "slider", zoom: 8, anchor: "center", actionAt: 2, variant: 1 },
  { duration: 6, kind: "toggle", zoom: 7, anchor: "bottom-right" },
  { duration: 40, kind: "window-drag", zoom: 1.3, anchor: "center", actionAt: 2, variant: 1 },
  ...accelerate(16, 9, 2).map<CutSpec>((duration, index) => ({
    duration,
    kind: CLICK_KINDS[(index * 2) % CLICK_KINDS.length],
    zoom: ZOOM_CYCLE[(index * 7) % ZOOM_CYCLE.length],
  })),
  { duration: 14, kind: "desktop", zoom: 2, anchor: "right", actionAt: 999, variant: 2 },
]

const montage: CutSpec[] = montageSpecs.map((spec, index) => ({
  theme: THEMES[index % THEMES.length],
  dark: index % 4 === 3,
  ...spec,
}))

export const WIZARD_LENGTH = 2 * FPS

const cuts = buildCuts([...opening, ...breath, ...boot, ...montage])

export const SHOTS: Cut[] = cuts

export const CRT_ON_AT = cuts.find((cut) => cut.kind === "desktop" && cut.move === "pull")!.from

export const WIZARD_AT = cuts[cuts.length - 1].from + cuts[cuts.length - 1].duration

export const TOTAL_FRAMES = WIZARD_AT + WIZARD_LENGTH

export const SLIDER_STEPS = 8

export function readSliderRange(cut: Cut): [number, number] {
  return cut.variant % 2 === 0 ? [20, 80] : [90, 30]
}

export function readDragLength(cut: Cut): number {
  return cut.duration - cut.actionAt - 10
}

export function readTypingCadence(cut: Cut): number {
  return cut.kind === "terminal" ? TYPING_CADENCE + 1 : TYPING_CADENCE
}

export const MENU_ITEMS = ["Programs", "Documents", "Settings", "Find", "Help", "Run..."]

export const MENU_STEP = 6

export const PROGRESS_STEP = 4

export const PROGRESS_SEGMENTS = 9

const CLICK_SOUNDS: Partial<Record<ShotKind, [string, string | null]>> = {
  button: ["button.press", "button.release"],
  cta: ["keycap.press", "keycap.release"],
  checkbox: ["checkbox.on", null],
  switch: ["switch.on", null],
  toggle: ["toggle.select", null],
  radio: ["radio.select", null],
  tabs: ["tab.select", null],
  keycap: ["keycap.press", "keycap.release"],
  taskbar: ["taskbar.press", "taskbar.release"],
  desktop: ["button.press", "button.release"],
}

export const RELEASE_DELAY = 5

function typingCues(cut: Cut, start: number): SoundCue[] {
  const cadence = readTypingCadence(cut)
  return [...cut.text].map((character, index) => ({
    at: start + index * cadence + (index % 3 === 2 ? 1 : 0),
    key: character === " " ? "typewriter.space" : "typewriter.key",
    volume: 1,
  }))
}

function cuesFor(cut: Cut): SoundCue[] {
  const start = cut.from + cut.actionAt
  const end = cut.from + cut.duration
  const click = CLICK_SOUNDS[cut.kind]
  if (cut.kind === "desktop" && cut.actionAt > cut.duration) {
    return []
  }
  if (click) {
    const [press, release] = click
    const cues: SoundCue[] = [{ at: start, key: press, volume: 1 }]
    if (release && start + RELEASE_DELAY < end) {
      cues.push({ at: start + RELEASE_DELAY, key: release, volume: 1 })
    }
    return cues
  }
  if (cut.kind === "power") {
    return [
      { at: cut.from, key: "taskbar.release", volume: 0.6 },
      { at: start, key: "switch.on", volume: 1 },
      { at: start, key: "lever.on", volume: 0.8 },
    ]
  }
  if (cut.kind === "type") {
    return [{ at: cut.from, key: "button.press", volume: 0.7 }, ...typingCues(cut, start)]
  }
  if (cut.kind === "terminal") {
    const cues = typingCues(cut, start)
    const returnAt = start + cut.text.length * readTypingCadence(cut) + 8
    return [{ at: cut.from, key: "keycap.release", volume: 0.7 }, ...cues, { at: returnAt, key: "typewriter.return", volume: 1 }]
  }
  if (cut.kind === "slider" || cut.kind === "window-drag") {
    const dragEnd = start + readDragLength(cut)
    const cues: SoundCue[] = [
      { at: start, key: "drag.pickup", volume: 1 },
      { at: dragEnd, key: "drag.drop", volume: 1 },
    ]
    if (cut.kind === "slider") {
      for (let step = 1; step < SLIDER_STEPS; step += 1) {
        cues.push({ at: start + Math.round((step / SLIDER_STEPS) * (dragEnd - start)), key: "slider.tick", volume: 0.9 })
      }
    }
    return cues
  }
  if (cut.kind === "menu") {
    return MENU_ITEMS.slice(0, 5).map((_, index) => ({ at: start + index * MENU_STEP, key: "menu.select", volume: 1 })).concat([
      { at: start + 5 * MENU_STEP + 4, key: "button.press", volume: 1 },
    ])
  }
  if (cut.kind === "progress") {
    return Array.from({ length: PROGRESS_SEGMENTS }, (_, index) => ({
      at: start + index * PROGRESS_STEP,
      key: "pad.tick",
      volume: 1,
    }))
  }
  return []
}

export const SHOT_CUES: SoundCue[] = SHOTS.flatMap(cuesFor)

export const POWER_CLICK_AT = (() => {
  const power = SHOTS.find((cut) => cut.kind === "power")!
  return power.from + power.actionAt
})()
