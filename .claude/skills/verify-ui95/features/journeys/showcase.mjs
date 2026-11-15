import { join } from "node:path"

async function mainText(page) {
  return page.locator("body").innerText()
}

export default async function verifyShowcase({ page, baseUrl, evidenceDir, expect }) {
  await page.goto(`${baseUrl}/hardware`, { waitUntil: "networkidle" })
  const tiles = page.locator('[data-part="hw-bento"] [data-part="hw-tile"]')
  const registry = await (await page.request.get(`${baseUrl}/r/registry.json`)).json()
  const partCount = registry.items.filter((item) => item.categories?.includes("hardware")).length
  expect("the Hardware95 showcase scatters one live tile per example, more tiles than parts", (await tiles.count()) > partCount, String(await tiles.count()))
  expect("Hardware95 tiles are live parts", (await page.locator('[data-part="hw-bento"] [role="slider"]').count()) >= 1)
  expect("the Hardware95 showcase prints no install command", !(await mainText(page)).includes("npx shadcn"))
  expect("the Hardware95 showcase scrolls", await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight))
  await page.screenshot({ path: join(evidenceDir, "hardware.png"), fullPage: true })
  await tiles.first().locator('[data-part="hw-tile-head"] a').click()
  await page.waitForURL(/\/hardware\/[a-z-]+$/)
  expect("a tile title opens that part's control panel", (await page.locator('[data-part="panel-app"]').count()) === 1 || (await page.locator("h1").count()) === 1)

  await page.goto(`${baseUrl}/ui`, { waitUntil: "networkidle" })
  expect("the UI95 showcase prints no install command", !(await mainText(page)).includes("npx shadcn"))
  expect("the UI95 showcase is a bento of live cards", (await page.locator('[data-slot="window"][data-span]').count()) > 40)
  await page.screenshot({ path: join(evidenceDir, "ui.png") })
  await page.locator('[data-slot="window"][data-span]').first().getByRole("link", { name: "Control panel" }).click()
  await page.waitForURL(/\/ui\/[a-z-]+$/)
  expect("a card opens its control panel", new URL(page.url()).pathname.startsWith("/ui/"))
}
