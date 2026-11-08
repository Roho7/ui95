import { buildLlmsFull } from "@/lib/docs/llms"

export const dynamic = "force-static"

export function GET() {
  return new Response(buildLlmsFull(), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
