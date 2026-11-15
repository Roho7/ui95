import { join } from "node:path"

async function readKnob(knob) {
  return knob.evaluate((element) => ({
    value: Number(element.getAttribute("aria-valuenow")),
    turn: element.style.getPropertyValue("--hw-turn"),
    dragging: element.hasAttribute("data-dragging"),
    focused: document.activeElement === element,
    ring: element.matches(":focus-visible"),
  }))
}

async function dragBy(page, knob, dy) {
  const box = await knob.boundingBox()
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y + dy, { steps: 12 })
  const held = await readKnob(knob)
  await page.mouse.up()
  return held
}

export default async function verifyRotaryKnob({ page, baseUrl, evidenceDir, expect }) {
  await page.addInitScript(() => {
    window.__soundPlays = 0
    const start = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.__soundPlays += 1
      return start.apply(this, args)
    }
  })
  await page.goto(`${baseUrl}/components`, { waitUntil: "networkidle" })
  const card = page.locator("#rotary-knob")
  await card.scrollIntoViewIfNeeded()
  const volume = card.getByRole("slider", { name: "Volume" })
  expect("volume knob starts at 62", (await readKnob(volume)).value === 62)
  await card.screenshot({ path: join(evidenceDir, "rest.png") })

  const held = await dragBy(page, volume, -44)
  const dragged = await readKnob(volume)
  expect("data-dragging is set while held and cleared on release", held.dragging && !dragged.dragging)
  expect("dragging up 44px of 220px adds a fifth of the range", dragged.value === 82, String(dragged.value))
  expect("the grip turns with the value", dragged.turn === `${0.82 * 270 - 135}deg`, dragged.turn)
  expect("a mouse drag focuses the knob without a focus ring", dragged.focused && !dragged.ring)

  await dragBy(page, volume, -400)
  expect("dragging past the stop clamps at max", (await readKnob(volume)).value === 100)
  expect("the controlled value lights the Clip lamp", (await card.getByRole("img", { name: "Clip on" }).count()) === 1)
  await card.screenshot({ path: join(evidenceDir, "volume-max.png") })

  await page.keyboard.press("Home")
  expect("Home goes to min and shows the focus ring", (await readKnob(volume)).value === 0 && (await readKnob(volume)).ring)
  await page.keyboard.press("ArrowUp")
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("PageUp")
  expect("arrows step by one and PageUp by a tenth", (await readKnob(volume)).value === 12, String((await readKnob(volume)).value))
  await page.keyboard.press("End")
  expect("End goes to max", (await readKnob(volume)).value === 100)

  const bass = card.getByRole("slider", { name: "Bass" })
  const bassBefore = (await readKnob(bass)).value
  await bass.hover()
  const scrollBefore = await page.evaluate(() => scrollY)
  await page.mouse.wheel(0, -100)
  await page.waitForTimeout(100)
  expect("the wheel turns the knob one step", (await readKnob(bass)).value === bassBefore + 1)
  expect("the wheel over a knob does not scroll the page", (await page.evaluate(() => scrollY)) === scrollBefore)

  const tone = card.getByRole("slider", { name: "Tone" })
  await tone.focus()
  await page.keyboard.press("PageUp")
  expect("a 0 to 10 knob pages by one", (await readKnob(tone)).value === 5)

  const locked = card.getByRole("slider", { name: "Locked" })
  await locked.focus()
  await page.keyboard.press("ArrowUp")
  expect("a disabled knob ignores keys", (await readKnob(locked)).value === 20)

  const treble = card.getByRole("slider", { name: "Treble" })
  const playsBefore = await page.evaluate(() => window.__soundPlays)
  await dragBy(page, treble, 44)
  await page.waitForTimeout(600)
  const plays = (await page.evaluate(() => window.__soundPlays)) - playsBefore
  const trebleAfter = (await readKnob(treble)).value
  expect("turning down a fifth plays one knob.tick per 5% detent", plays === 4 && trebleAfter === 50, `${plays} plays, treble ${trebleAfter}`)
}
