import { join } from "node:path"

export default async function verifyCrtMonitor({ page, baseUrl, evidenceDir, expect }) {
  await page.goto(`${baseUrl}/hardware/crt-monitor`, { waitUntil: "networkidle" })
  const [on, off] = [page.locator('[data-part="monitor"]').nth(0), page.locator('[data-part="monitor"]').nth(1)]
  expect("the on variant shows a raster with the CRT effect", (await on.locator('[data-part="monitor-raster"] [data-slot="crt-screen"]').count()) === 1)
  expect("the off variant shows dark glass and no raster", (await off.locator('[data-part="monitor-raster"]').count()) === 0)
  expect("the off variant's power lamp is dark", (await off.getByRole("img", { name: "off" }).count()) === 1)
  await on.screenshot({ path: join(evidenceDir, "on.png") })

  const power = off.getByRole("button", { name: "Power" })
  await power.click()
  expect("pressing Power turns the screen on", (await off.locator('[data-part="monitor-raster"]').count()) === 1 && (await power.getAttribute("aria-pressed")) === "true")
  expect("the power lamp lights", (await off.getByRole("img", { name: "on" }).count()) === 1)
  await page.waitForTimeout(700)
  expect("the warm-up ends at full height", (await off.locator('[data-part="monitor-raster"]').evaluate((element) => getComputedStyle(element).transform)) === "none" || (await off.locator('[data-part="monitor-raster"]').evaluate((element) => getComputedStyle(element).transform)).startsWith("matrix(1, 0, 0, 1"))
  await power.click()
  expect("pressing Power again turns it off", (await off.locator('[data-part="monitor-raster"]').count()) === 0)

  await page.evaluate(() => document.querySelector('[data-part="monitor"]')?.style.setProperty("--hw-brightness", "0.5"))
  const filter = await on.locator('[data-part="monitor-raster"]').evaluate((element) => getComputedStyle(element).filter)
  expect("brightness reaches the raster filter", filter.includes("0.5"), filter)
}
