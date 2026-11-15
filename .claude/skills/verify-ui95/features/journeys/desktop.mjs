import { join } from "node:path"

async function openStartMenu(page) {
  const start = page.getByRole("button", { name: "Start" })
  await start.focus()
  await page.keyboard.press("Enter")
}

export default async function verifyDesktop({ page, baseUrl, evidenceDir, expect }) {
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Power" }).click()
  await page.getByRole("region", { name: "install.bat" }).waitFor({ timeout: 8000 })
  await page.screenshot({ path: join(evidenceDir, "desktop.png") })

  const terminal = page.getByRole("region", { name: "install.bat" })
  expect("install.bat window is on the desktop", (await terminal.count()) === 1)
  const titlebar = terminal.locator("[data-slot=window-titlebar]")
  const before = await terminal.boundingBox()
  const handle = await titlebar.boundingBox()
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
  await page.mouse.down()
  await page.mouse.move(handle.x + handle.width / 2 + 141, handle.y + handle.height / 2 + 93, { steps: 6 })
  await page.mouse.up()
  const after = await terminal.boundingBox()
  const deltaX = after.x - before.x
  const deltaY = after.y - before.y
  expect("dragging the title bar moves the window", deltaX > 100 && deltaY > 60, `moved ${deltaX}, ${deltaY}`)
  expect("the window follows the cursor one to one on screen, even inside the scaled CRT", Math.abs(deltaX - 141) <= 3 && Math.abs(deltaY - 93) <= 3, `moved ${deltaX}, ${deltaY}`)
  const layout = await terminal.evaluate((element) => [element.offsetLeft, element.offsetTop])
  expect("the drop position snaps to the 2px --pixel grid", layout.every((value) => value % 2 === 0), layout.join(", "))
  await page.screenshot({ path: join(evidenceDir, "after-drag.png") })

  await openStartMenu(page)
  const about = page.getByRole("menuitem", { name: "About UI95" })
  expect("Start opens the start menu", await about.isVisible())
  await page.screenshot({ path: join(evidenceDir, "start-menu.png") })
  await about.click()
  const dialog = page.getByRole("dialog", { name: "About UI95" })
  expect("About UI95 opens a dialog", await dialog.isVisible())
  await page.screenshot({ path: join(evidenceDir, "about-dialog.png") })
  await page.keyboard.press("Escape")
  await dialog.waitFor({ state: "hidden" })
  expect("Escape closes the dialog", !(await dialog.isVisible()))

  await openStartMenu(page)
  await page.getByRole("menuitem", { name: "Components" }).click()
  await page.waitForURL(`${baseUrl}/ui`)
  expect("Start > Components navigates to the catalogue", page.url().endsWith("/ui"))
}
