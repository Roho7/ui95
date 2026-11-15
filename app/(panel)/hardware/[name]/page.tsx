import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ControlPanel, type PanelDoc } from "@/components/panel/ControlPanel"
import { markdownUrl } from "@/lib/docs/llms"
import { findDoc, REGISTRY_DOCS } from "@/lib/docs/registry-docs"
import { docHref } from "@/lib/docs/routes"
import type { RegistryDoc } from "@/lib/docs/types"
import { pageMetadata } from "@/lib/seo"

type PanelPageProps = {
  params: Promise<{ name: string }>
}

export const dynamicParams = false

const DOCS = REGISTRY_DOCS.filter((doc) => doc.library === "hardware95")

export function generateStaticParams() {
  return DOCS.map((doc) => ({ name: doc.name }))
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
  }
  return <ControlPanel key={doc.name} doc={panelDoc} />
}
