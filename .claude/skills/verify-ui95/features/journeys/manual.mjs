import { join } from "node:path"

const OTHER_CHROME = '[data-slot="taskbar"], [data-slot="menubar"], [data-slot="window"], [data-part="hw-site"]'

export default async function verifyManual({ page, baseUrl, evidenceDir, expect }) {
  await page.goto(`${baseUrl}/docs`, { waitUntil: "networkidle" })
  expect("/docs renders the paper manual", (await page.locator('[data-part="manual-site"]').count()) === 1)
  expect("the manual renders neither Win95 nor Hardware95 chrome", (await page.locator(OTHER_CHROME).count()) === 0)
  const contents = (await page.locator('[data-part="manual-contents"] li').allTextContents()).map((text) => text.trim())
  expect("the contents list the three chapters in order", contents.join(" | ") === "1. The system | 2. Installation | 3. Sound", contents.join(" | "))
  expect("the current chapter is marked", (await page.locator('[data-part="manual-contents"] a[aria-current="page"]').textContent())?.trim() === "1. The system")
  await page.screenshot({ path: join(evidenceDir, "system.png") })

  await page.getByRole("link", { name: "Next: Installation" }).click()
  await page.waitForURL(`${baseUrl}/docs/installation`)
  const sections = await page.locator('[data-part="manual-main"] h2').allTextContents()
  expect("installation covers both libraries", sections.some((text) => text.includes("UI95")) && sections.some((text) => text.includes("Hardware95")), sections.join(" | "))
  const commands = await page.locator('[data-part="manual-code"] code').allTextContents()
  expect("installation shows the theme, hardware and rotary-knob commands", ["theme.json", "hardware.json", "rotary-knob.json"].every((file) => commands.some((command) => command.includes(file))))
  await page.getByRole("button", { name: "pnpm" }).first().click()
  expect("choosing pnpm rewrites the install commands", (await page.locator('[data-part="manual-code"] code').allTextContents()).some((command) => command.startsWith("pnpm dlx shadcn")))
  await page.screenshot({ path: join(evidenceDir, "installation.png"), fullPage: true })

  await page.goto(`${baseUrl}/docs/sound`, { waitUntil: "networkidle" })
  expect("the sound chapter keeps its code samples", (await page.locator('[data-part="manual-code"]').count()) >= 4)

  await page.goto(`${baseUrl}/ui/about`, { waitUntil: "networkidle" })
  expect("the old UI95 introduction lives at /ui/about in the Win95 chrome", (await page.locator('[data-slot="menubar"]').count()) >= 1)

  await page.goto(`${baseUrl}/hardware`, { waitUntil: "networkidle" })
  await page.getByRole("link", { name: "Manual" }).click()
  await page.waitForURL(`${baseUrl}/docs`)
  expect("the Hardware95 Manual key opens the manual", new URL(page.url()).pathname === "/docs")
}
