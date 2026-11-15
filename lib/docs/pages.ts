import { HARDWARE_DOCS, listDocsInSection, SECTION_LABELS, SECTION_ORDER } from "./registry-docs"
import { docHref } from "./routes"

export type DocPage = {
  href: string
  title: string
  description: string
}

export type DocGroup = {
  label: string
  isCounted: boolean
  pages: DocPage[]
}

export const GUIDE_PAGES: DocPage[] = [
  {
    href: "/docs",
    title: "Introduction",
    description: "What UI95 is and how a component page is organised.",
  },
  {
    href: "/docs/installation",
    title: "Installation",
    description: "How to make your app look like this.",
  },
  {
    href: "/docs/theming",
    title: "Theming",
    description: "There are different kinds of retro vibes.",
  },
  {
    href: "/docs/sound",
    title: "Sound",
    description: "Synthesized clicks for every control, and how to add them.",
  },
]

export const UI95_DOC_GROUPS: DocGroup[] = [
  { label: "Getting started", isCounted: false, pages: GUIDE_PAGES },
  ...SECTION_ORDER.map((section) => ({
    label: SECTION_LABELS[section],
    isCounted: true,
    pages: listDocsInSection(section).map((doc) => ({
      href: docHref(doc.name),
      title: doc.title,
      description: doc.description,
    })),
  })),
]

export const HARDWARE_DOC_GROUP: DocGroup = {
  label: SECTION_LABELS.hardware,
  isCounted: true,
  pages: HARDWARE_DOCS.map((doc) => ({ href: docHref(doc.name), title: doc.title, description: doc.description })),
}

export const DOC_GROUPS: DocGroup[] = [UI95_DOC_GROUPS[0], HARDWARE_DOC_GROUP, ...UI95_DOC_GROUPS.slice(1)]

export const DOC_PAGES: DocPage[] = UI95_DOC_GROUPS.flatMap((group) => group.pages)

export function findNeighbors(href: string): { previous: DocPage | null; next: DocPage | null } {
  const index = DOC_PAGES.findIndex((page) => page.href === href)
  return {
    previous: index > 0 ? DOC_PAGES[index - 1] : null,
    next: index >= 0 && index < DOC_PAGES.length - 1 ? DOC_PAGES[index + 1] : null,
  }
}
