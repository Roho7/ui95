import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { renderSoundPatch } from "../../lib/sound/render.ts"
import type { SoundsConfig } from "../../lib/sound/types.ts"

const SAMPLE_RATE = 48000
const VARIANTS = 6
const AMBIENCE_SECONDS = 32
const CLICK_PEAK = Math.pow(10, -4 / 20)

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, "..", "public", "sfx")
const config = JSON.parse(readFileSync(join(here, "..", "..", "sounds.json"), "utf8")) as SoundsConfig

function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = state
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

function writeWav(name: string, samples: Float32Array) {
  const data = Buffer.alloc(samples.length * 2)
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]))
    data.writeInt16LE(Math.round(clamped * 32767), index * 2)
  }
  const header = Buffer.alloc(44)
  header.write("RIFF", 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write("WAVE", 8)
  header.write("fmt ", 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(SAMPLE_RATE, 24)
  header.writeUInt32LE(SAMPLE_RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write("data", 36)
  header.writeUInt32LE(data.length, 40)
  writeFileSync(join(outDir, `${name}.wav`), Buffer.concat([header, data]))
}

function onePole(samples: Float32Array, cutoff: number, mode: "low" | "high") {
  const coefficient = Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE)
  let low = 0
  for (let index = 0; index < samples.length; index += 1) {
    low = (1 - coefficient) * samples[index] + coefficient * low
    samples[index] = mode === "low" ? low : samples[index] - low
  }
}

function fadeEdges(samples: Float32Array, seconds: number) {
  const span = Math.floor(seconds * SAMPLE_RATE)
  for (let index = 0; index < span; index += 1) {
    const gain = index / span
    samples[index] *= gain
    samples[samples.length - 1 - index] *= gain
  }
}

function renderRoomTone(random: () => number): Float32Array {
  const samples = new Float32Array(AMBIENCE_SECONDS * SAMPLE_RATE)
  let brown = 0
  for (let index = 0; index < samples.length; index += 1) {
    brown = (brown + (random() * 2 - 1) * 0.02) * 0.998
    const time = index / SAMPLE_RATE
    const air = (random() * 2 - 1) * 0.004
    const swell = 0.85 + 0.15 * Math.sin(time * 0.31) * Math.sin(time * 0.17 + 1)
    samples[index] = (brown * 0.9 + air) * swell
  }
  onePole(samples, 30, "high")
  onePole(samples, 2400, "low")
  fadeEdges(samples, 0.05)
  return samples
}

function renderCrtBuzz(random: () => number): Float32Array {
  const samples = new Float32Array(AMBIENCE_SECONDS * SAMPLE_RATE)
  let crackle = 0
  for (let index = 0; index < samples.length; index += 1) {
    const time = index / SAMPLE_RATE
    const mains = 2 * Math.PI * 60 * time
    const hum = Math.sin(mains) * 0.5 + Math.sin(mains * 2) * 0.35 + Math.sin(mains * 3) * 0.18 + Math.sin(mains * 5) * 0.08
    const buzz = Math.sign(Math.sin(mains * 2)) * 0.05
    const whine = Math.sin(2 * Math.PI * 15734 * time) * 0.035
    if (random() < 0.00012) {
      crackle = (random() * 2 - 1) * 0.9
    }
    crackle *= 0.985
    const wobble = 0.9 + 0.1 * Math.sin(time * 2.3) * Math.sin(time * 0.7)
    samples[index] = (hum * 0.07 + buzz * 0.5 + crackle * 0.08) * wobble + whine
  }
  fadeEdges(samples, 0.05)
  return samples
}

function renderCrtOn(random: () => number): Float32Array {
  const length = Math.floor(1.8 * SAMPLE_RATE)
  const samples = new Float32Array(length)
  for (let index = 0; index < length; index += 1) {
    const time = index / SAMPLE_RATE
    const relay = time < 0.012 ? (random() * 2 - 1) * Math.pow(1 - time / 0.012, 2) * 0.8 : 0
    const thump = Math.sin(2 * Math.PI * 48 * time) * Math.exp(-time * 9) * 0.7
    const degaussEnvelope = time < 0.04 ? time / 0.04 : Math.exp(-(time - 0.04) * 2.4)
    const mains = 2 * Math.PI * 60 * time
    const degauss = (Math.sin(mains) * 0.6 + Math.sign(Math.sin(mains * 2)) * 0.25 + Math.sin(mains * 3) * 0.2) * degaussEnvelope * (0.75 + 0.25 * Math.sin(time * 37))
    const whineLevel = Math.min(time / 0.6, 1) * 0.03
    const whine = Math.sin(2 * Math.PI * (9000 + 6734 * Math.min(time / 0.5, 1)) * time) * whineLevel
    const crackle = random() < 0.002 ? (random() * 2 - 1) * Math.exp(-time * 3) * 0.6 : 0
    samples[index] = relay + thump + degauss * 0.35 + whine + crackle
  }
  fadeEdges(samples, 0.003)
  return samples
}

function renderFriction(random: () => number): Float32Array {
  const samples = new Float32Array(3 * SAMPLE_RATE)
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = (random() * 2 - 1) * 0.35
  }
  onePole(samples, 700, "high")
  onePole(samples, 5000, "low")
  fadeEdges(samples, 0.01)
  return samples
}

mkdirSync(outDir, { recursive: true })

const manifest: Record<string, number> = {}
let seed = 95
for (const [key, entry] of Object.entries(config.sounds)) {
  if (!entry || !("layers" in entry)) {
    continue
  }
  const variants = Array.from({ length: VARIANTS }, () =>
    renderSoundPatch(entry, { sampleRate: SAMPLE_RATE, jitter: true, random: seeded(seed++) })
  )
  const peak = Math.max(...variants.map((samples) => samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0)))
  const gain = CLICK_PEAK / Math.max(peak, 1e-6)
  variants.forEach((samples, variant) => writeWav(`${key}-${variant}`, samples.map((sample) => sample * gain)))
  manifest[key] = VARIANTS
}

writeWav("room-tone", renderRoomTone(seeded(1)))
writeWav("crt-buzz", renderCrtBuzz(seeded(2)))
writeWav("crt-on", renderCrtOn(seeded(3)))
writeWav("drag-friction", renderFriction(seeded(4)))

console.log(`Rendered ${Object.keys(manifest).length} UI95 sounds x ${VARIANTS} variants + 4 ambience files to ${outDir}`)
