import { join } from "node:path"

async function fitsWithoutScroll(page) {
  return page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1 && document.documentElement.scrollWidth <= window.innerWidth + 1)
}

export default async function verifyControlPanel({ page, baseUrl, evidenceDir, expect }) {
  await page.addInitScript(() => {
    window.__copied = []
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text) => window.__copied.push(text) }, configurable: true })
  })
  await page.goto(`${baseUrl}/hardware/rotary-knob`, { waitUntil: "networkidle" })
  const stage = page.locator('[data-part="panel-stage"]')
  const controls = page.locator('[data-part="panel-controls"]')
  expect("the part page is a control panel with no sidebar", (await page.locator('[data-part="panel-app"]').count()) === 1 && (await page.locator("aside").count()) === 0)
  expect("Hardware95 uses the instrument skin", (await page.locator('[data-part="panel-app"]').getAttribute("data-skin")) === "instrument")
  for (const size of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size)
    expect(`no page scroll at ${size.width}x${size.height}`, await fitsWithoutScroll(page))
  }
  const labels = (await controls.locator("[data-panel-control] > label").allTextContents()).map((text) => text.trim().toLowerCase())
  expect("controls are generated from the prop schema", ["label", "size", "variant", "cap", "disabled", "value", "finish"].every((name) => labels.includes(name)), labels.join(", "))

  await controls.getByRole("radiogroup", { name: "variant" }).getByRole("radio", { name: "pointer" }).click()
  expect("choosing variant pointer updates the stage", (await stage.locator('[data-part="knob"]').getAttribute("data-variant")) === "pointer")
  await controls.getByRole("radiogroup", { name: "size" }).getByRole("radio", { name: "lg" }).click()
  expect("choosing size lg updates the stage", (await stage.locator('[data-part="knob"]').getAttribute("data-size")) === "lg")
  await controls.getByLabel("label").fill("Gain")
  expect("editing the label prints it on the part", (await stage.getByRole("slider", { name: "Gain" }).count()) === 1)
  await controls.getByRole("radiogroup", { name: "Finish" }).getByRole("radio", { name: "cream" }).click()
  expect("the finish control restyles the faceplate", (await stage.locator('[data-part="faceplate"]').getAttribute("data-finish")) === "cream")
  const knob = stage.getByRole("slider", { name: "Gain" })
  await knob.focus()
  await page.keyboard.press("End")
  expect("turning the part on stage moves the value control", (await controls.locator("#panel-value").inputValue()) === "100")
  await page.screenshot({ path: join(evidenceDir, "rotary-knob.png") })

  await page.getByRole("button", { name: "Copy prompt" }).click()
  const prompt = await page.evaluate(() => window.__copied.at(-1) ?? "")
  expect("Copy prompt copies a short agent prompt, not the page", prompt.length < 2000 && prompt.startsWith("# Rotary knob (@ui95/rotary-knob)"), `${prompt.length} chars`)
  expect("the prompt carries install, import, props and an example", ["npx shadcn@latest add @ui95/rotary-knob", 'import { RotaryKnob } from "@/components/hardware/rotary-knob"', "Props:", "- variant?: \"skirted\" | \"pointer\""].every((line) => prompt.includes(line)))
  expect("the prompt's example matches the controls on stage", prompt.includes('<RotaryKnob label="Gain" size="lg" variant="pointer" value={100} />'), prompt.split("Example:\n")[1]?.split("\n")[0])
  expect("the key confirms the copy", (await page.getByRole("button", { name: "Prompt copied" }).count()) === 1)
  expect("no install command is printed on the page", !(await page.locator("body").innerText()).includes("npx shadcn"))

  const sound = page.getByRole("button", { name: /Sound/ })
  const soundBefore = await sound.getAttribute("aria-pressed")
  await sound.click()
  expect("the sound key toggles", (await sound.getAttribute("aria-pressed")) !== soundBefore)

  await page.goto(`${baseUrl}/ui/button`, { waitUntil: "networkidle" })
  expect("UI95 uses the Win95 skin", (await page.locator('[data-part="panel-app"]').getAttribute("data-skin")) === "win95")
  await page.locator('[data-part="panel-controls"]').getByRole("radio", { name: "outline" }).click()
  expect("choosing variant outline updates the live button", (await page.locator('[data-part="panel-stage"]').getByRole("button", { name: "Press me" }).getAttribute("data-variant")) === "outline")
  await page.locator("#panel-palette").selectOption("cyan-pixel")
  expect("the palette control rethemes the page", (await page.evaluate(() => document.documentElement.dataset.theme)) === "cyan-pixel")
  await page.locator("#panel-palette").selectOption("phosphor")
  await page.screenshot({ path: join(evidenceDir, "button.png") })

  await page.goto(`${baseUrl}/hardware/hardware`, { waitUntil: "networkidle" })
  const folders = page.locator('[data-part="panel-folders"]')
  expect("the folder window marks the current component", (await folders.locator('[aria-current="page"]').textContent())?.trim() === "Hardware95 foundation")
  await folders.getByRole("searchbox", { name: "Search components" }).fill("rot")
  expect("searching narrows the folders", (await folders.locator('[data-part="panel-folder"]').count()) === 1)
  await folders.getByRole("link", { name: "Rotary knob" }).click()
  await page.waitForURL(`${baseUrl}/hardware/rotary-knob`)
  expect("a folder loads its component onto the stage and the URL", (await page.locator('[data-part="panel-stage"]').getByRole("slider", { name: "Volume" }).count()) === 1)
  await page.screenshot({ path: join(evidenceDir, "folders-hardware.png") })

  await page.goto(`${baseUrl}/ui/button`, { waitUntil: "networkidle" })
  const uiFolders = page.locator('[data-part="panel-folders"]')
  expect("UI95 folders are grouped by section", (await uiFolders.locator('[data-part="panel-folder-heading"]').allTextContents()).join(",") === "Components,Blocks,Utilities")
  const search = uiFolders.getByRole("searchbox", { name: "Search components" })
  await search.fill("switch")
  await search.press("Enter")
  await page.waitForURL(`${baseUrl}/ui/switch`)
  expect("Enter in the search opens the first match", (await page.locator('[data-part="panel-header"] h1').textContent()) === "Switch")
  for (const size of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size)
    expect(`no page scroll with the folder window at ${size.width}x${size.height}`, await fitsWithoutScroll(page))
  }
  await page.screenshot({ path: join(evidenceDir, "folders-ui.png") })

  await page.goto(`${baseUrl}/ui/window`, { waitUntil: "networkidle" })
  const example = page.getByRole("radiogroup", { name: "Example" })
  expect("components without a schema fall back to their examples", (await example.getByRole("radio").count()) >= 2 && (await page.locator('[data-panel-status]').textContent()) === "Example")
}
