const FIXED = [
  ["/components", "/ui"],
  ["/docs/theming", "/ui/theming"],
]

async function readRedirect(request, url) {
  const response = await request.get(url, { maxRedirects: 0 })
  return { status: response.status(), location: response.headers().location ?? "" }
}

export default async function verifyLegacyUrls({ page, baseUrl, expect }) {
  const registry = await (await page.request.get(`${baseUrl}/r/registry.json`)).json()
  const documented = registry.items.filter((item) => item.type !== "registry:style")
  const expected = [
    ...FIXED,
    ...documented.map((item) => [`/components/${item.name}`, `${item.categories?.includes("hardware") ? "/hardware" : "/ui"}/${item.name}`]),
  ]
  const wrong = []
  for (const [from, to] of expected) {
    const { status, location } = await readRedirect(page.request, `${baseUrl}${from}`)
    const target = location.startsWith("http") ? new URL(location).pathname : location
    if (status !== 308 || target !== to) {
      wrong.push(`${from} → ${status} ${location}`)
      continue
    }
    const landed = await page.request.get(`${baseUrl}${to}`)
    if (landed.status() !== 200) {
      wrong.push(`${to} → ${landed.status()}`)
    }
  }
  expect(`all ${expected.length} old URLs redirect with 308 to a page that loads`, wrong.length === 0, wrong.slice(0, 5).join(" | "))

  for (const path of ["/ui/button.md", "/hardware/rotary-knob.md"]) {
    const response = await page.request.get(`${baseUrl}${path}`)
    expect(`${path} serves markdown`, response.status() === 200 && (response.headers()["content-type"] ?? "").includes("text/markdown"))
  }
}
