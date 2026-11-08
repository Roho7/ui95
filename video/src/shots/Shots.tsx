import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion"

import { Taskbar, TaskbarTask } from "@/components/retro/taskbar"
import { Window } from "@/components/retro/window"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { CtaButton } from "@/components/ui/cta-button"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { useShaderSettle } from "../CrtLayer"
import { Target } from "../Target"
import {
  type Cut,
  MENU_ITEMS,
  MENU_STEP,
  PROGRESS_SEGMENTS,
  PROGRESS_STEP,
  readDragLength,
  readSliderRange,
  readTypingCadence,
  RELEASE_DELAY,
} from "../timeline"

export type ShotProps = { cut: Cut }

const pick = <T,>(items: readonly T[], index: number): T => items[index % items.length]

function useApproach(actionAt: number) {
  const frame = useCurrentFrame()
  const offset =
    actionAt <= 0
      ? 0
      : interpolate(frame, [0, actionAt], [1, 0], {
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.2, 0.8, 0.3, 1),
        })
  return { frame, offsetX: offset * 120, offsetY: offset * 80, isActed: frame >= actionAt }
}

export function ButtonWidget({ cut }: ShotProps) {
  const { frame, offsetX, offsetY } = useApproach(cut.actionAt)
  const isPressed = frame >= cut.actionAt && frame < cut.actionAt + RELEASE_DELAY
  const variants = ["default", "secondary", "outline"] as const
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Target offsetX={offsetX} offsetY={offsetY} isPressed={isPressed}>
        <Button variant={pick(variants, cut.variant)} data-force-active={isPressed ? "" : undefined}>
          {pick(["OK", "Yes", "Save", "Run"], cut.variant)}
        </Button>
      </Target>
      <Button variant="outline">Cancel</Button>
    </div>
  )
}

export function CheckboxWidget({ cut }: ShotProps) {
  const { offsetX, offsetY, isActed } = useApproach(cut.actionAt)
  const labels = ["Autosave.exe", "Show hidden files", "Turbo mode"]
  const active = cut.variant % labels.length
  return (
    <div className="flex flex-col gap-3 text-xl">
      {labels.map((label, index) => (
        <label key={label} className="flex items-center gap-3">
          {index === active ? (
            <Target offsetX={offsetX} offsetY={offsetY} isPressed={isActed}>
              <Checkbox checked={isActed} />
            </Target>
          ) : (
            <Checkbox checked={index % 2 === 0} />
          )}
          {label}
        </label>
      ))}
    </div>
  )
}

export function SwitchWidget({ cut }: ShotProps) {
  const { offsetX, offsetY, isActed } = useApproach(cut.actionAt)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Target offsetX={offsetX} offsetY={offsetY} isPressed={isActed}>
          <Switch checked={isActed} />
        </Target>
        <Label>{pick(["Turbo", "Screensaver", "Num lock"], cut.variant)}</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked />
        <Label>Modem</Label>
      </div>
    </div>
  )
}

export function ToggleWidget({ cut }: ShotProps) {
  const { offsetX, offsetY, isActed } = useApproach(cut.actionAt)
  const items = ["B", "I", "U"]
  const target = items[(cut.variant + 1) % items.length]
  const before = items[cut.variant % items.length]
  return (
    <ToggleGroup type="single" value={isActed ? target : before} variant="outline" spacing={0}>
      {items.map((item) =>
        item === target ? (
          <Target key={item} offsetX={offsetX} offsetY={offsetY} isPressed={isActed}>
            <ToggleGroupItem value={item}>{item}</ToggleGroupItem>
          </Target>
        ) : (
          <ToggleGroupItem key={item} value={item}>
            {item}
          </ToggleGroupItem>
        )
      )}
    </ToggleGroup>
  )
}

export function RadioWidget({ cut }: ShotProps) {
  const { offsetX, offsetY, isActed } = useApproach(cut.actionAt)
  const drives = ["A:", "C:", "D:"]
  const target = drives[(cut.variant % 2) + 1]
  return (
    <RadioGroup value={isActed ? target : "A:"}>
      {drives.map((drive) => (
        <div key={drive} className="flex items-center gap-3">
          {drive === target ? (
            <Target offsetX={offsetX} offsetY={offsetY} isPressed={isActed}>
              <RadioGroupItem value={drive} />
            </Target>
          ) : (
            <RadioGroupItem value={drive} />
          )}
          <Label>{drive}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}

export function TabsWidget({ cut }: ShotProps) {
  const { offsetX, offsetY, isActed } = useApproach(cut.actionAt)
  return (
    <Tabs value={isActed ? "sound" : "general"}>
      <TabsList variant={cut.variant % 2 === 0 ? "default" : "line"}>
        <TabsTrigger value="general">General</TabsTrigger>
        <Target offsetX={offsetX} offsetY={offsetY} isPressed={isActed}>
          <TabsTrigger value="sound">Sound</TabsTrigger>
        </Target>
        <TabsTrigger value="modem">Modem</TabsTrigger>
      </TabsList>
      <TabsContent value="general">System: UI95 0.0.1. Memory: 640K.</TabsContent>
      <TabsContent value="sound">Speaker: PC beeper. Volume: loud.</TabsContent>
    </Tabs>
  )
}

export function KeycapWidget({ cut }: ShotProps) {
  const frame = useCurrentFrame()
  const isPressed = frame >= cut.actionAt && frame < cut.actionAt + RELEASE_DELAY
  const keys = ["Ctrl", "Alt", "Del"]
  const target = keys[cut.variant % keys.length]
  return (
    <KbdGroup>
      {keys.map((key, index) => (
        <span key={key} className="inline-flex items-center gap-1">
          {index > 0 && <span className="text-lg">+</span>}
          {key === target ? (
            <Target hasCursor={false}>
              <Kbd style={isPressed ? { translate: "0 2px", boxShadow: "none" } : undefined}>{key}</Kbd>
            </Target>
          ) : (
            <Kbd>{key}</Kbd>
          )}
        </span>
      ))}
    </KbdGroup>
  )
}

export function TaskbarWidget({ cut }: ShotProps) {
  const { frame, offsetX, offsetY } = useApproach(cut.actionAt)
  const isActed = frame >= cut.actionAt
  const programs = ["Paint", "Terminal", "Notepad"]
  const target = programs[(cut.variant % 2) + 1]
  return (
    <div className="w-full">
      <Taskbar clock={<span className="flex h-7 items-center bevel-sunken offset-shadow-none px-3 text-xl leading-none">9:41 PM</span>}>
        {programs.map((program) =>
          program === target ? (
            <Target key={program} offsetX={offsetX} offsetY={offsetY} isPressed={isActed && frame < cut.actionAt + RELEASE_DELAY} className="min-w-0 shrink-0 basis-[calc((100%-(var(--taskbar-tasks)-1)*var(--pixel)*2)/var(--taskbar-tasks))]">
              <TaskbarTask isActive={isActed} className="w-full basis-auto">
                {program}
              </TaskbarTask>
            </Target>
          ) : (
            <TaskbarTask key={program} isActive={!isActed && program === programs[0]}>
              {program}
            </TaskbarTask>
          )
        )}
      </Taskbar>
    </div>
  )
}

export function CtaWidget({ cut }: ShotProps) {
  const { frame, offsetX, offsetY } = useApproach(cut.actionAt)
  const { fps } = useVideoConfig()
  useShaderSettle(frame)
  const isPressed = frame >= cut.actionAt && frame < cut.actionAt + RELEASE_DELAY
  return (
    <div className="flex">
      <Target offsetX={offsetX} offsetY={offsetY} isPressed={isPressed}>
        <CtaButton size="lg" data-force-active={isPressed ? "" : undefined} shine={{ speed: 0, fps, frame: (frame / fps) * 1000 }}>
          {pick(["Get UI95", "Get started", "Install"], cut.variant)}
        </CtaButton>
      </Target>
    </div>
  )
}

export function SliderWidget({ cut }: ShotProps) {
  const frame = useCurrentFrame()
  const [from, to] = readSliderRange(cut)
  const dragLength = readDragLength(cut)
  const value = interpolate(frame, [cut.actionAt, cut.actionAt + dragLength], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  })
  const isHolding = frame >= cut.actionAt && frame <= cut.actionAt + dragLength
  return (
    <Target cursorX={value / 100} cursorY={0.5} isPressed={isHolding} className="w-full">
      <Slider value={[value]} className="w-full" aria-label="Regular" />
    </Target>
  )
}

export function TypeWidget({ cut }: ShotProps) {
  const frame = useCurrentFrame()
  const typed = Math.max(0, Math.min(cut.text.length, Math.floor((frame - cut.actionAt) / readTypingCadence(cut)) + 1))
  const isCaretOn = Math.floor(frame / 16) % 2 === 0
  return (
    <Target hasCursor={false} className="w-full">
      <Input readOnly value={`${cut.text.slice(0, typed)}${isCaretOn ? "_" : ""}`} className="w-full" />
    </Target>
  )
}

export function TerminalWidget({ cut }: ShotProps) {
  const frame = useCurrentFrame()
  const cadence = readTypingCadence(cut)
  const typed = Math.max(0, Math.min(cut.text.length, Math.floor((frame - cut.actionAt) / cadence) + 1))
  const returnAt = cut.actionAt + cut.text.length * cadence + 8
  const hasReturned = frame >= returnAt
  const isCaretOn = Math.floor(frame / 16) % 2 === 0
  return (
    <pre className="h-56 bg-black p-4 font-mono text-xl leading-tight text-[#c0c0c0]">
      {"C:\\> mem /c\n640K conventional, 384K upper\n"}
      <Target hasCursor={false}>
        <span>{`C:\\> ${cut.text.slice(0, typed)}${!hasReturned && isCaretOn ? "_" : ""}`}</span>
      </Target>
      {hasReturned ? "\nInsert new diskette for drive A:\nand press ENTER when ready..._" : ""}
    </pre>
  )
}

export function MenuWidget({ cut }: ShotProps) {
  const frame = useCurrentFrame()
  const index = Math.max(0, Math.min(4, Math.floor((frame - cut.actionAt) / MENU_STEP)))
  return (
    <Command value={MENU_ITEMS[index]} className="w-full text-xl">
      <CommandList>
        <CommandGroup>
          {MENU_ITEMS.map((item, itemIndex) =>
            itemIndex === index ? (
              <Target key={item} cursorX={0.7} className="w-full">
                <CommandItem value={item} className="w-full">
                  {item}
                </CommandItem>
              </Target>
            ) : (
              <CommandItem key={item} value={item}>
                {item}
              </CommandItem>
            )
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function ProgressWidget({ cut }: ShotProps) {
  const frame = useCurrentFrame()
  const steps = Math.max(0, Math.min(PROGRESS_SEGMENTS, Math.floor((frame - cut.actionAt) / PROGRESS_STEP) + 1))
  return (
    <div className="flex w-full flex-col gap-2">
      <Target hasCursor={false} className="w-full">
        <Progress value={(steps / PROGRESS_SEGMENTS) * 100} className="w-full" />
      </Target>
      <span className="text-right text-lg">{Math.round((steps / PROGRESS_SEGMENTS) * 100)}%</span>
    </div>
  )
}

export function DraggedWindow({ cut }: ShotProps) {
  const frame = useCurrentFrame()
  const dragLength = readDragLength(cut)
  const progress = interpolate(frame, [cut.actionAt, cut.actionAt + dragLength], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.5, 0, 0.3, 1),
  })
  const isHolding = frame >= cut.actionAt && frame <= cut.actionAt + dragLength
  const direction = cut.variant % 2 === 0 ? 1 : -1
  return (
    <div className="absolute" style={{ left: 760 + direction * (progress * 420 - 210), top: 380 - progress * 140 }}>
      <Window title="Notes.txt" onClose={() => {}} style={{ width: 400 }} statusBar={<span>Ln 1, Col 1</span>}>
        <p className="p-3 text-xl">Buy floppies. Defrag on Sunday.</p>
      </Window>
      <div className="absolute" style={{ left: 140, top: 16 }}>
        <Target isPressed={isHolding}>
          <span className="block size-1" />
        </Target>
      </div>
    </div>
  )
}

export type WidgetSpec = {
  Widget: (props: ShotProps) => React.ReactNode
  entry: string
  title: string
}

export const WIDGETS: Record<string, WidgetSpec> = {
  button: { Widget: ButtonWidget, entry: "button", title: "Info" },
  cta: { Widget: CtaWidget, entry: "cta-button", title: "Get UI95" },
  checkbox: { Widget: CheckboxWidget, entry: "checkbox", title: "Options" },
  switch: { Widget: SwitchWidget, entry: "switch", title: "Settings" },
  toggle: { Widget: ToggleWidget, entry: "toggle-group", title: "WordPad" },
  radio: { Widget: RadioWidget, entry: "radio-group", title: "Drive" },
  tabs: { Widget: TabsWidget, entry: "tabs", title: "System Properties" },
  keycap: { Widget: KeycapWidget, entry: "kbd", title: "Keyboard" },
  taskbar: { Widget: TaskbarWidget, entry: "taskbar", title: "Taskbar" },
  slider: { Widget: SliderWidget, entry: "slider", title: "Volume" },
  type: { Widget: TypeWidget, entry: "input", title: "Run" },
  terminal: { Widget: TerminalWidget, entry: "terminal", title: "MS-DOS Prompt" },
  menu: { Widget: MenuWidget, entry: "command", title: "Start" },
  progress: { Widget: ProgressWidget, entry: "progress", title: "Copying..." },
}
