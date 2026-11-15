import { join } from "node:path"

const WIN95_CHROME = '[data-slot="taskbar"], [data-slot="menubar"], [data-slot="crt-screen"], [data-slot="window"]'

export default async function verifyHardwareChrome({ page, baseUrl, evidenceDir, expect }) {
  await page.goto(`${baseUrl}/components/rotary-knob`, { waitUntil: "networkidle" })
  expect("/components/rotary-knob redirects to /hardware/rotary-knob", new URL(page.url()).pathname === "/hardware/rotary-knob", page.url())
  expect("the part page renders no Win95 chrome", (await page.locator(WIN95_CHROME).count()) === 0)
  expect("the part page sits in the Hardware95 shell", (await page.locator('[data-part="hw-site"] [data-part="hw-masthead"]').count()) === 1)
  const headingFont = await page.locator("h1").evaluate((element) => getComputedStyle(element).fontFamily)
  expect("the heading is printed in the condensed panel face, not a pixel font", !/silkscreen|vt323|pixel/i.test(headingFont), headingFont)
  const currentPart = page.locator('[data-part="hw-index"] a[aria-current="page"]')
  expect("the parts index lights the current part", (await currentPart.textContent())?.trim() === "Rotary knob" && (await currentPart.locator("[data-on]").count()) === 1)
  expect("the Parts key is lit", (await page.locator('[data-part="hw-nav"] a[aria-current="page"]').textContent())?.trim() === "Parts")
  await page.screenshot({ path: join(evidenceDir, "rotary-knob.png") })

  await page.goto(`${baseUrl}/components/hardware`, { waitUntil: "networkidle" })
  expect("/components/hardware redirects to /hardware/hardware", new URL(page.url()).pathname === "/hardware/hardware", page.url())

  await page.goto(`${baseUrl}/hardware`, { waitUntil: "networkidle" })
  expect("the catalogue shows one tile per Hardware95 part", (await page.locator('[data-part="hw-tile"]').count()) === 2)
  expect("the catalogue renders no Win95 chrome", (await page.locator(WIN95_CHROME).count()) === 0)
  await page.screenshot({ path: join(evidenceDir, "catalogue.png") })

  await page.goto(`${baseUrl}/ui/button`, { waitUntil: "networkidle" })
  const sidebar = page.locator("aside")
  expect("the UI95 sidebar no longer lists Hardware95 parts", (await sidebar.getByText("Rotary knob", { exact: true }).count()) === 0)
  await page.getByRole("menuitem", { name: "Hardware95" }).click()
  const allParts = page.getByRole("menuitem", { name: "All parts" })
  expect("the UI95 menubar has a Hardware95 menu that links to /hardware", (await allParts.getAttribute("href")) === "/hardware")
  await page.keyboard.press("Escape")

  await page.goto(`${baseUrl}/ui`, { waitUntil: "networkidle" })
  expect("the UI95 catalogue no longer shows Hardware95 cards", (await page.locator("#rotary-knob, #hardware").count()) === 0)

  const llms = await (await page.request.get(`${baseUrl}/llms.txt`)).text()
  expect("llms.txt still lists Hardware95 parts at their new URLs", llms.includes("/hardware/rotary-knob") && llms.includes("## Hardware95"))
}
