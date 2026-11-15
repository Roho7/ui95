import { join } from "node:path"

export default async function verifyCrtMonitor({ page, baseUrl, evidenceDir, expect }) {
  await page.goto(`${baseUrl}/hardware/crt-monitor`, { waitUntil: "networkidle" })
  const stage = page.locator('[data-part="panel-stage"]')
  const monitor = stage.locator('[data-part="monitor"]')
  const example = page.getByRole("radiogroup", { name: "Example" })
  expect("the on example shows a raster with the CRT effect", (await monitor.locator('[data-part="monitor-raster"] [data-slot="crt-screen"]').count()) === 1)
  await stage.screenshot({ path: join(evidenceDir, "on.png") })

  await example.getByRole("radio", { name: "off" }).click()
  expect("the off example shows dark glass and no raster", (await monitor.locator('[data-part="monitor-raster"]').count()) === 0)
  expect("the off example's power lamp is dark", (await monitor.getByRole("img", { name: "off" }).count()) === 1)

  const power = monitor.getByRole("button", { name: "Power" })
  await power.click()
  expect("pressing Power turns the screen on", (await monitor.locator('[data-part="monitor-raster"]').count()) === 1 && (await power.getAttribute("aria-pressed")) === "true")
  expect("the power lamp lights", (await monitor.getByRole("img", { name: "on" }).count()) === 1)
  await page.waitForTimeout(700)
  const transform = await monitor.locator('[data-part="monitor-raster"]').evaluate((element) => getComputedStyle(element).transform)
  expect("the warm-up ends at full height", transform === "none" || transform.startsWith("matrix(1, 0, 0, 1"), transform)
  await power.click()
  expect("pressing Power again turns it off", (await monitor.locator('[data-part="monitor-raster"]').count()) === 0)

  await power.click()
  await page.waitForTimeout(700)
  await monitor.evaluate((element) => element.style.setProperty("--hw-brightness", "0.5"))
  const filter = await monitor.locator('[data-part="monitor-raster"]').evaluate((element) => getComputedStyle(element).filter)
  expect("brightness reaches the raster filter", filter.includes("0.5"), filter)
}
