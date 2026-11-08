import { registryDocToMarkdown } from "@/lib/docs/markdown"
import { DOC_GROUPS } from "@/lib/docs/pages"
import { findDoc } from "@/lib/docs/registry-docs"
import type { RegistryDoc } from "@/lib/docs/types"
import {
  absoluteUrl,
  REGISTRY_URL,
  registryItemUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SOURCE_URL,
} from "@/lib/site"

const COMPONENT_PREFIX = "/components/"

function docForHref(href: string): RegistryDoc | undefined {
  return href.startsWith(COMPONENT_PREFIX) ? findDoc(href.slice(COMPONENT_PREFIX.length)) : undefined
}

export function markdownUrl(name: string): string {
  return absoluteUrl(`${COMPONENT_PREFIX}${name}.md`)
}

function header(): string[] {
  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_TAGLINE} ${SITE_DESCRIPTION}`,
    "",
    `${SITE_NAME} lives at ${absoluteUrl("/")} and its source is ${SOURCE_URL}. It is a shadcn/ui registry for Radix projects, not the Preact ui95 library or another Windows 95 theme.`,
    "",
    "## Quick start",
    "",
    "1. Start a Radix shadcn project: `npx shadcn@latest init -b radix`. Base UI is not supported yet.",
    `2. Add the theme: \`npx shadcn@latest add ${registryItemUrl("theme")}\``,
    `3. Add any item: \`npx shadcn@latest add ${absoluteUrl("/r/<name>.json")}\``,
    `4. Or register the namespace once with \`npx shadcn@latest registry add "@ui95=${REGISTRY_URL}"\` and install by name: \`npx shadcn@latest add @ui95/button\``,
  ]
}

export function buildLlmsIndex(): string {
  const sections = DOC_GROUPS.flatMap((group) => [
    "",
    `## ${group.label}`,
    "",
    ...group.pages.map((page) => {
      const doc = docForHref(page.href)
      const extras = doc ? ` Markdown: ${markdownUrl(doc.name)} Registry: ${registryItemUrl(doc.name)}` : ""
      return `- [${page.title}](${absoluteUrl(page.href)}): ${page.description}${extras}`
    }),
  ])
  const optional = ["", "## Optional", "", `- [Full docs in one file](${absoluteUrl("/llms-full.txt")}): Every component page as markdown, with source.`]
  return [...header(), ...sections, ...optional, ""].join("\n")
}

export function buildLlmsFull(): string {
  const docs = DOC_GROUPS.flatMap((group) => group.pages.flatMap((page) => docForHref(page.href) ?? []))
  return [...header(), "", ...docs.flatMap((doc) => ["---", "", registryDocToMarkdown(doc)])].join("\n")
}
