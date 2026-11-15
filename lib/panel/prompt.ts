import type { ComponentApi, Library, PropDoc } from "@/lib/docs/types"
import { absoluteUrl, REGISTRY_URL } from "@/lib/site"

import type { PanelValue } from "./controls"

export type PromptInput = {
  name: string
  title: string
  library: Library
  description: string
  href: string
  importPath: string | null
  api: ComponentApi | undefined
  values: Record<string, PanelValue>
  children?: string
}

function describeProp(prop: PropDoc): string {
  const type = prop.options ? prop.options.map((option) => `"${option}"`).join(" | ") : prop.type
  const fallback = prop.defaultValue ? `, default ${prop.defaultValue}` : ""
  return `- ${prop.name}${prop.required ? "" : "?"}: ${type}${fallback}`
}

function formatAttribute(name: string, value: PanelValue): string | null {
  if (value === undefined || value === false) {
    return null
  }
  if (value === true) {
    return name
  }
  return typeof value === "number" ? `${name}={${value}}` : `${name}="${value}"`
}

function buildExample(input: PromptInput): string {
  const component = input.api?.name ?? "Component"
  const props = new Map(input.api?.props.map((prop) => [prop.name, prop]) ?? [])
  const attributes = Object.entries(input.values)
    .filter(([name, value]) => {
      const fallback = props.get(name)?.defaultValue?.replace(/^["']|["']$/g, "")
      return fallback === undefined || String(value) !== fallback
    })
    .flatMap(([name, value]) => formatAttribute(name, value) ?? [])
  const open = [component, ...attributes].join(" ")
  return input.children ? `<${open}>${input.children}</${component}>` : `<${open} />`
}

export function buildAgentPrompt(input: PromptInput): string {
  const props = input.api?.props.filter((prop) => !prop.type.includes("=>") && prop.name !== "className") ?? []
  return [
    `# ${input.title} (@ui95/${input.name})`,
    "",
    input.description,
    "",
    "Install (shadcn CLI, once per project for the registry, then the item):",
    `npx shadcn@latest registry add "@ui95=${REGISTRY_URL}"`,
    ...(input.library === "hardware95" ? [] : ["npx shadcn@latest add @ui95/theme"]),
    `npx shadcn@latest add @ui95/${input.name}`,
    "",
    ...(input.importPath && input.api ? ["Import:", `import { ${input.api.name} } from "${input.importPath}"`, ""] : []),
    ...(props.length > 0 ? ["Props:", ...props.map(describeProp), ""] : []),
    ...(input.api ? ["Example:", buildExample(input), ""] : []),
    `Docs: ${absoluteUrl(input.href)}`,
  ].join("\n")
}
