import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ControlPanel, type PanelDoc } from "@/components/panel/ControlPanel"
import { markdownUrl } from "@/lib/docs/llms"
import { findDoc, REGISTRY_DOCS, SECTION_LABELS, SECTION_ORDER } from "@/lib/docs/registry-docs"
import { docHref } from "@/lib/docs/routes"
import type { RegistryDoc } from "@/lib/docs/types"
import { pageMetadata } from "@/lib/seo"

type PanelPageProps = {
  params: Promise<{ name: string }>
}

export const dynamicParams = false

const DOCS = REGISTRY_DOCS.filter((doc) => doc.library !== "hardware95")

const FOLDERS = [...DOCS].sort((a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section)).map((doc) => ({
  name: doc.name,
  title: doc.title,
  group: doc.library === "hardware95" ? "Parts" : SECTION_LABELS[doc.section],
  href: docHref(doc.name),
}))

export function generateStaticParams() {
  return DOCS.map((doc) => ({ name: doc.name }))
}

function readImportPath(doc: RegistryDoc): string | null {
  const source = doc.files.find((file) => file.path.endsWith(".tsx"))
  return source ? `@/${source.path.replace(/\.tsx$/, "")}` : null
}

function readDoc(name: string): RegistryDoc | undefined {
  return DOCS.some((doc) => doc.name === name) ? findDoc(name) : undefined
}

export async function generateMetadata({ params }: PanelPageProps): Promise<Metadata> {
  const doc = readDoc((await params).name)
  if (!doc) {
    return {}
  }
  const metadata = pageMetadata({ title: doc.title, description: doc.description, path: docHref(doc.name) })
  return { ...metadata, alternates: { ...metadata.alternates, types: { "text/markdown": markdownUrl(doc.name) } } }
}

export default async function PanelPage({ params }: PanelPageProps) {
  const doc = readDoc((await params).name)
  if (!doc) {
    notFound()
  }
  const panelDoc: PanelDoc = {
    name: doc.name,
    title: doc.title,
    description: doc.description,
    library: doc.library,
    api: doc.api,
    sounds: doc.sounds,
    registryDependencies: doc.registryDependencies,
    dependencies: doc.dependencies,
    href: docHref(doc.name),
    importPath: readImportPath(doc),
  }
  return <ControlPanel key={doc.name} doc={panelDoc} folders={FOLDERS} />
}
