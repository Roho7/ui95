import { join } from "node:path"

export default async function verifyLanding({ page, baseUrl, evidenceDir, expect }) {
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" })
  const screen = page.locator('[data-part="monitor-screen"]')
  expect("the machine starts off with dark glass", (await screen.locator('[data-part="monitor-raster"]').count()) === 0)
  expect("the landing renders no Win95 site chrome around the machine", (await page.locator('[data-slot="crt-screen"][data-fullscreen], [data-part="hw-site"], [data-part="manual-site"]').count()) === 0)
  expect("a pulsing lamp prompts the visitor to press power", (await page.getByText("Press power to boot the machine").count()) === 1)
  await page.screenshot({ path: join(evidenceDir, "off.png") })

  await page.getByRole("button", { name: "Power" }).click()
  await page.waitForSelector('[data-part="machine-boot"][data-state="booting"]', { timeout: 3000 })
  expect("power warms the CRT and runs the boot text", (await screen.getByText("MEMORY TEST 640K OK").count()) === 1)
  await page.screenshot({ path: join(evidenceDir, "booting.png") })

  const readme = screen.getByRole("region", { name: "README.TXT" })
  await readme.waitFor({ timeout: 6000 })
  expect("the UI95 desktop boots inside the monitor", await readme.isVisible())
  await screen.getByRole("button", { name: "Start" }).click()
  expect("the desktop inside the screen is interactive", (await page.getByRole("menuitem", { name: "Components" }).count()) >= 1)
  await page.keyboard.press("Escape")
  await page.screenshot({ path: join(evidenceDir, "on.png") })

  const raster = screen.locator('[data-part="monitor-raster"]')
  const before = await raster.evaluate((element) => getComputedStyle(element).filter)
  await page.getByRole("slider", { name: "Bright" }).focus()
  await page.keyboard.press("End")
  const after = await raster.evaluate((element) => getComputedStyle(element).filter)
  expect("the Bright knob changes the picture", before !== after && after.includes("1.4"), `${before} then ${after}`)

  await page.getByRole("button", { name: "Power" }).click()
  expect("pressing power again switches the machine off", (await screen.locator('[data-part="monitor-raster"]').count()) === 0)

  await page.getByRole("link", { name: /Software · UI95/ }).click()
  await page.waitForURL(`${baseUrl}/ui`)
  expect("the software door leads to UI95", new URL(page.url()).pathname === "/ui")
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" })
  await page.getByRole("link", { name: /Hardware · Hardware95/ }).click()
  await page.waitForURL(`${baseUrl}/hardware`)
  expect("the hardware door leads to Hardware95", new URL(page.url()).pathname === "/hardware")
}
