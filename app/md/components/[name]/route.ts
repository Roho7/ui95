import { registryDocToMarkdown } from "@/lib/docs/markdown"
import { findDoc, REGISTRY_DOCS } from "@/lib/docs/registry-docs"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return REGISTRY_DOCS.map((doc) => ({ name: doc.name }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const doc = findDoc(name)
  if (!doc) {
    return new Response("Not found", { status: 404 })
  }
  return new Response(registryDocToMarkdown(doc), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
