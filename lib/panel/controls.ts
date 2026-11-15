import type { ComponentApi } from "@/lib/docs/types"

export type PanelValue = string | number | boolean | undefined

export type PanelControl =
  | { kind: "select"; prop: string; options: readonly string[]; initial: string | undefined }
  | { kind: "toggle"; prop: string; initial: boolean }
  | { kind: "range"; prop: string; min: number; max: number; step: number; initial: number }
  | { kind: "text"; prop: string; initial: string }

export type PanelRange = { min: number; max: number; step: number }

export type PanelControlHints = {
  ranges?: Record<string, PanelRange>
  text?: Record<string, string>
  hide?: readonly string[]
}

const NEVER_CONTROLLED = new Set(["asChild", "className", "style", "children", "defaultValue"])

function parseLiteral(value: string | null): string | undefined {
  return value?.replace(/^["']|["']$/g, "")
}

export function deriveControls(api: ComponentApi, hints: PanelControlHints = {}): PanelControl[] {
  return api.props.flatMap((prop): PanelControl[] => {
    if (NEVER_CONTROLLED.has(prop.name) || hints.hide?.includes(prop.name)) {
      return []
    }
    if (prop.options) {
      return [{ kind: "select", prop: prop.name, options: prop.options, initial: parseLiteral(prop.defaultValue) }]
    }
    if (prop.type === "boolean") {
      return [{ kind: "toggle", prop: prop.name, initial: prop.defaultValue === "true" }]
    }
    const range = hints.ranges?.[prop.name]
    if (prop.type === "number" && range) {
      const initial = Number(prop.defaultValue ?? range.min)
      return [{ kind: "range", prop: prop.name, ...range, initial: Number.isFinite(initial) ? initial : range.min }]
    }
    const text = hints.text?.[prop.name]
    if (prop.type === "string" && text !== undefined) {
      return [{ kind: "text", prop: prop.name, initial: text }]
    }
    return []
  })
}

export function initialValues(controls: readonly PanelControl[]): Record<string, PanelValue> {
  return Object.fromEntries(controls.map((control) => [control.prop, control.initial]))
}
