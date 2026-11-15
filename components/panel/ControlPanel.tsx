"use client"

import "@/components/hardware/hardware.css"
import "./panel.css"

import Link from "next/link"
import { useTheme } from "next-themes"
import * as React from "react"

import { PALETTES } from "@/app/_site/palettes"
import { useIsHydrated } from "@/app/_site/useIsHydrated"
import { usePalette } from "@/app/_site/usePalette"
import { Faceplate, type FaceplateFinish } from "@/components/hardware/faceplate"
import { SHOWCASE_ENTRIES } from "@/components/showcase/demos.generated"
import { useSoundEnabled } from "@/hooks/use-sound"
import type { Library, RegistryDoc } from "@/lib/docs/types"
import { deriveControls, initialValues, type PanelControl, type PanelValue } from "@/lib/panel/controls"

import { type FolderEntry, FolderWindow } from "./FolderWindow"
import { PANEL_SPECS } from "./specs"

export type PanelDoc = Pick<RegistryDoc, "name" | "title" | "description" | "library" | "api" | "sounds" | "registryDependencies" | "dependencies">

const FINISHES: readonly FaceplateFinish[] = ["putty", "cream", "khaki"]

const SKIN: Record<Library, { skin: "instrument" | "win95"; system: string; home: string }> = {
  hardware95: { skin: "instrument", system: "Hardware95 control panel", home: "/hardware" },
  ui95: { skin: "win95", system: "UI95 control panel", home: "/ui" },
  shared: { skin: "win95", system: "UI95 control panel", home: "/ui" },
}

function Box({ title, part, children, aside }: { title: string; part: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section data-part={part} data-panel-box="" aria-label={title}>
      <header data-panel-caption="">
        <span>{title}</span>
        {aside}
      </header>
      <div data-panel-body="">{children}</div>
    </section>
  )
}

function Segmented({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string | undefined; onChange: (value: string) => void }) {
  if (options.length > 6) {
    return (
      <select aria-label={label} data-panel-select="" value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }
  return (
    <div role="radiogroup" aria-label={label} data-panel-segmented="">
      {options.map((option) => (
        <button key={option} type="button" role="radio" aria-checked={option === value} data-slot="button" onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  )
}

function Control({ control, value, onChange }: { control: PanelControl; value: PanelValue; onChange: (value: PanelValue) => void }) {
  const id = `panel-${control.prop}`
  return (
    <div data-panel-control="" data-kind={control.kind}>
      <label htmlFor={id}>{control.prop}</label>
      {control.kind === "select" && <Segmented label={control.prop} options={control.options} value={value as string | undefined} onChange={onChange} />}
      {control.kind === "toggle" && (
        <button id={id} type="button" role="switch" aria-checked={value === true} data-panel-toggle="" data-slot="button" onClick={() => onChange(value !== true)}>
          {value === true ? "On" : "Off"}
        </button>
      )}
      {control.kind === "range" && (
        <div data-panel-range="">
          <input id={id} type="range" min={control.min} max={control.max} step={control.step} value={Number(value)} onChange={(event) => onChange(Number(event.target.value))} />
          <output htmlFor={id}>{String(value)}</output>
        </div>
      )}
      {control.kind === "text" && <input id={id} type="text" data-panel-text="" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />}
    </div>
  )
}

function ThemeControls({ library, finish, onFinish }: { library: Library; finish: FaceplateFinish; onFinish: (finish: FaceplateFinish) => void }) {
  const [palette, setPalette] = usePalette()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = useIsHydrated() && resolvedTheme === "dark"
  if (library === "hardware95") {
    return (
      <div data-panel-control="">
        <label>finish</label>
        <Segmented label="Finish" options={FINISHES} value={finish} onChange={(value) => onFinish(value as FaceplateFinish)} />
      </div>
    )
  }
  return (
    <>
      <div data-panel-control="">
        <label htmlFor="panel-palette">palette</label>
        <select id="panel-palette" data-panel-select="" value={palette} onChange={(event) => setPalette(event.target.value as typeof palette)}>
          {PALETTES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div data-panel-control="">
        <label>dark</label>
        <button type="button" role="switch" aria-checked={isDark} aria-label="Dark mode" data-panel-toggle="" data-slot="button" onClick={() => setTheme(isDark ? "light" : "dark")}>
          {isDark ? "On" : "Off"}
        </button>
      </div>
    </>
  )
}

function SoundKey() {
  const [isEnabled, setEnabled] = useSoundEnabled()
  return (
    <button type="button" data-panel-key="" data-slot="button" aria-pressed={isEnabled} onClick={() => setEnabled(!isEnabled)}>
      Sound {isEnabled ? "on" : "off"}
    </button>
  )
}

function useStage(doc: PanelDoc) {
  const spec = PANEL_SPECS[doc.name]
  const api = doc.api[0]
  const controls = React.useMemo(() => (spec && api ? deriveControls(api, spec) : []), [spec, api])
  const variants = SHOWCASE_ENTRIES.find((entry) => entry.name === doc.name)?.demo.variants ?? []
  return { spec, controls, variants }
}

function ControlPanel({ doc, folders }: { doc: PanelDoc; folders: readonly FolderEntry[] }) {
  const { spec, controls, variants } = useStage(doc)
  const frame = SKIN[doc.library]
  const [values, setValues] = React.useState(() => initialValues(controls))
  const [liveValue, setLiveValue] = React.useState(spec?.valueProp?.initial ?? 0)
  const [variantLabel, setVariantLabel] = React.useState(variants[0]?.label)
  const [finish, setFinish] = React.useState<FaceplateFinish>("putty")
  const setValue = (prop: string, value: PanelValue) => setValues((current) => ({ ...current, [prop]: value }))

  const live = spec && (() => {
    const Component = spec.component
    const valueProps = spec.valueProp ? { [spec.valueProp.value]: liveValue, [spec.valueProp.onChange]: setLiveValue } : {}
    const element = <Component {...spec.base} {...values} {...valueProps}>{spec.children}</Component>
    return doc.library === "hardware95" ? <Faceplate finish={finish}>{element}</Faceplate> : element
  })
  const variant = variants.find((candidate) => candidate.label === variantLabel) ?? variants[0]

  return (
    <div data-hw={frame.skin === "instrument" ? "" : undefined} data-part="panel-app" data-skin={frame.skin}>
      <div data-part="panel-screen">
        <header data-part="panel-header">
          <Link href={frame.home} data-part="panel-system">
            <span aria-hidden data-part="panel-mark" />
            {frame.system}
          </Link>
          <h1>{doc.title}</h1>
          <SoundKey />
        </header>
        <Box title="Stage" part="panel-stage" aside={<span data-panel-status="">{spec ? "Live" : "Example"}</span>}>
          <div data-part="panel-stage-surface">
            <div data-part="panel-stage-content" style={spec ? undefined : { "--panel-zoom": 1 } as React.CSSProperties}>
              {live ? live() : variant?.render()}
            </div>
          </div>
        </Box>
        <Box title="Controls" part="panel-controls">
          {spec ? (
            controls.map((control) => <Control key={control.prop} control={control} value={values[control.prop]} onChange={(value) => setValue(control.prop, value)} />)
          ) : (
            <div data-panel-control="">
              <label>example</label>
              <Segmented label="Example" options={variants.map((candidate) => candidate.label)} value={variant?.label} onChange={setVariantLabel} />
            </div>
          )}
          {spec?.valueProp && (
            <div data-panel-control="" data-kind="range">
              <label htmlFor="panel-value">{spec.valueProp.value}</label>
              <div data-panel-range="">
                <input id="panel-value" type="range" min={Number(values.min ?? 0)} max={Number(values.max ?? 100)} step={Number(values.step ?? 1)} value={liveValue} onChange={(event) => setLiveValue(Number(event.target.value))} />
                <output htmlFor="panel-value">{liveValue}</output>
              </div>
            </div>
          )}
          <ThemeControls library={doc.library} finish={finish} onFinish={setFinish} />
        </Box>
        <Box title="Readout" part="panel-readout">
          <p>{doc.description}</p>
          <dl>
            <dt>Library</dt>
            <dd>{doc.library === "hardware95" ? "Hardware95" : "UI95"}</dd>
            <dt>Uses</dt>
            <dd>{doc.registryDependencies.join(", ") || "none"}</dd>
            <dt>Sounds</dt>
            <dd>{doc.sounds.join(", ") || "none"}</dd>
          </dl>
        </Box>
        <FolderWindow entries={folders} current={doc.name} />
      </div>
    </div>
  )
}

export { ControlPanel }
