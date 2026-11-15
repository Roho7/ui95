# Direction: from retro component library to retro hardware

UI95 today is a shadcn registry of Win95-style reskins: 57 `registry:ui` items, 5 blocks, a theme and a sound engine. The goal is to make UI95 the place to get funky retro hardware controls, such as knobs, dials, meters, switches and displays, the way [SPEC-01](https://spec-01.vercel.app/) is for modern pocket-instrument hardware. The classic library stays installable and documented, but the site and the roadmap put hardware first.

This doc covers what SPEC-01 ships and how, what UI95 keeps, changes and adds, the distribution model, the first components, the site restructure and a phased PR plan. Open questions for Rohosen are at the end.

Research date: 2026-11-15. SPEC-01 is two days old (its repo was created on 2026-11-13), so check the counts below again before quoting them.

## What SPEC-01 is

SPEC-01 is a hardware theme for [Vercel UI SDK](https://ui-sdk.dev), by Shu Ding, MIT licensed. Its site meta description reads: "A hardware theme for Vercel UI SDK: keys, knobs, dials, LCDs and switches with haptics and sound. 61 components, installable from a shadcn registry."

Sources read for this section:

- The site: <https://spec-01.vercel.app/>, its JS bundle and its OG image <https://spec-01.vercel.app/og.png>.
- The registry index: <https://spec-01.vercel.app/r/registry.json>, plus the `hardware`, `flat-knob` and `lcd` items at `https://spec-01.vercel.app/r/<name>.json`.
- The repo and its README: <https://github.com/shuding/spec-01>.
- Vercel UI SDK: <https://ui-sdk.dev>, repo <https://github.com/vercel-labs/ui>, npm package `@ui-sdk/react` (latest `0.1.0-beta.1`, Apache-2.0).

### What it ships

The registry index has 122 items:

| Type | Count | What they are |
|---|---|---|
| `registry:item` | 1 | `hardware`, the skin every other item depends on |
| `registry:ui` | 62 | The components (the README counts 61; `icon` is a helper) |
| `registry:component` | 52 | `<component>-demo` usage examples, one per catalogue panel |
| `registry:block` | 7 | Devices: `music-player`, `paint`, `midi-editor`, `timer`, `color`, `image-editor`, `dashboard` |

Every standard control is reinterpreted as a physical object, not reskinned. The registry descriptions name the object:

- `button`: "A key standing in its hole: primary, secondary or round, with haptics and a press sound."
- `checkbox`: "A latching key that stays down while checked, with an indicator lamp."
- `select`: "A thumb wheel of options, scrolled or dragged to choose."
- `page-wheel`: "Pagination as a thumb wheel with previous and next keys."
- `date-setter`: "A month calendar set with keys, like a watch's date."

The hardware-only controls are `flat-knob`, `mode-dial`, `slide-switch`, `dpad`, `lcd`, `display`, `bar-graph`, `meter` and `device`. Two of them, read in source:

- `flat-knob` draws a ring of 28 SVG ticks over a 270 degree sweep, every ninth tick heavier, lit up to the value. It turns by dragging (UI SDK `NumberInput` with a scrub area) and fires a `selection` haptic each time a tick lights or goes out, so the click and the light land together.
- `lcd` is a gray reflective readout. `LcdDigits` prints the value over faint "ghost" digits (every digit as `8` by default), as on a real segment display.

### How a developer installs one

From the [README](https://github.com/shuding/spec-01):

```sh
npx shadcn@latest registry add @spec-01=https://spec-01.vercel.app/r/{name}.json
npx shadcn@latest add @spec-01/mode-dial @spec-01/slider
```

Any item also installs from its URL. Components land in `components/ui/`, examples in `components/examples/` and devices in `components/blocks/<device>/`. Then the app wraps its tree in the root:

```tsx
<Hardware keyColor={{ l: 0.64, c: 0.31, h: 48 }}>
	<ModeDial label="Effort" options={options} defaultValue="medium" />
</Hardware>
```

The `hardware` item carries the whole skin. It installs `hardware.tsx`, 29 CSS files under `components/ui/hardware/`, seven `lib/*.ts` behaviour files and an IBM Plex Mono `@import`. Its JSON is about 520 KB, and every component lists it in `registryDependencies`, so installing one knob installs the whole skin.

The homepage's primary install action is not a CLI command. An "Installation prompt" popover holds three lines of text for a coding agent, and its Copy key toasts "Paste it into your coding agent." The text names the registry URL and says to wrap the app in `<Hardware>`.

### How it is built

- The site is a Vite + React 19 SPA with a hand-rolled `pushState` router ([`package.json`](https://github.com/shuding/spec-01/blob/main/package.json)). The site imports from `registry/hardware/`, so the demo and the shipped code are the same files. `scripts/registry.mjs` generates `registry.json`.
- Behaviour comes from `@ui-sdk/core` and `@ui-sdk/react`, pinned to a snapshot build (`0.0.0-20261111125312.ga16c1d57`). Icons come from `@carbon/icons-react`.
- Styling is plain CSS scoped to `[data-skin="hardware"]`. Component parts carry `data-kit` attributes that the skin targets. Tailwind is not needed.
- Theming is one OKLCH key color, passed as `--theme-l`, `--theme-c` and `--theme-h`. `tokens.css` derives every role from it with relative color syntax: `--key-ink` for text, `--key-lamp` for lit LEDs, `--key-cap` for filled chips and `--key-glow` for lit things on dark screens. A light key such as yellow gets near-black ink, so it stays readable.
- `lib/haptics.ts` maps presses to named haptics (`selection`, `light`, `medium`, `rigid`, `soft`, `success`, `warning`, `error`). It plays them through `navigator.vibrate` where it exists. On iOS 18, which has no Vibration API, it clicks a hidden label tied to an `<input type="checkbox" switch>`, which plays the system haptic inside a user gesture.
- `lib/sound.ts` synthesizes every sound with Web Audio, with no audio files, and varies pitch and level per play. Keys sound twice (a thock on press, a click on release), detents tick, on-screen elements blip like a piezo, text fields sound like a keyboard and popups pop. `haptic(kind)` also plays the matching sound, so one call drives both. Sound is on by default, and the mute choice is saved in `localStorage`.

### How the site presents components

- The nav has eight pages: Components, Player, Paint, MIDI, Timer, Color, Photo and Dashboard. One page is the catalogue. The other seven are devices.
- Beside the nav sit a key-color picker (six swatches: orange-red, yellow, green, blue, violet, black) and a sound toggle. The picker recolors the whole page and redraws the favicon in the chosen color.
- The homepage is the catalogue. It shows a masthead, the install prompt, then a grid of 52 numbered panels ("01 Button", "02 Switch" through "57 Slide switch"), some marked wide. Each panel is a live demo. Hovering over a panel's title, or tapping it on touch, opens a popover that lists the UI SDK behaviours the control is built on.
- Each device sits on a `Device` faceplate. A plate shows a model code, a name and a power LED, for example "MP-1 Player" and "TM-1 Timer". The faceplate scales itself down with CSS `zoom` when the page is narrower than the device.
- There are no per-component doc pages. The registry descriptions and the README carry the docs.

### What makes it feel special

1. **Every control has a physical referent.** The descriptions name the object first and the behaviour second. A checkbox is a latching key, so it stays down.
2. **Feedback is multi-sensory and consistent.** Each interaction kind has a haptic, a sound and a visual that fire together from one call.
3. **One input themes everything.** A single OKLCH color recolors keys, ink, lamps and glow, and the site lets you try it live.
4. **Devices prove the kit.** Seven working mini-apps show that the parts compose into something you would want to use, not just a grid of swatches.
5. **Install is agent-first.** The headline install action is a prompt to paste into a coding agent.

## Where UI95 stands

- **Registry.** `registry.json` holds 68 items: 57 `registry:ui`, 5 `registry:block`, 5 `registry:lib` and the `theme` `registry:style`. Consumers register `@ui95=https://www.ui95.dev/r/{style}/{name}.json`. `app/r/[style]/[file]/route.ts` redirects `radix-*` styles to `public/r/<file>` and refuses `base-*` styles for every item.
- **Theme coupling.** `theme` writes the full shadcn token set (`:root`, `.dark`, `@theme inline`) plus the four inks. A project that installs any UI95 item adopts the retro look app-wide.
- **Look.** [`DESIGN.md`](DESIGN.md) sets four inks, square corners, no alpha, stepped motion and ordered dither. `scripts/check-style.mjs` enforces it and fails on `rounded-*`, alpha colors and tweened transitions. `avatar` already draws round shapes as stepped pixel discs with `clip-path`.
- **Rendering.** `DitherImage` (CPU Bayer), `ShaderMount` (WebGL2 at a stepped frame rate), `crt-screen` (CRT warp shader) and `cta-button` (a keycap whose face tilts toward the pointer in 5 quantized steps).
- **Sound.** Further along than SPEC-01's. `sounds.json` configures every patch, `SoundEngine` supports detent `step()` and drag `startLoop()`, `attachSoundSlots` maps `data-slot` and `aria-valuenow` changes to sounds, and `/sound-lab` is a sound designer. Sound is opt-in. There are no haptics.
- **Site.** `/` is a Win95 desktop with eight windows (README.TXT, Setup.exe, install.bat, Paint and others). `/components` is a bento catalogue and `/components/[name]` a generated doc page per item. `/docs` has four guides. `/llms.txt`, `/llms-full.txt` and per-component markdown under `/md` exist.
- **Roadmap.** [`ROADMAP.md`](../ROADMAP.md) already lists nine "special components" to build later: `crt-player`, `pov-keyboard`, `hold-to-speak`, `rotary-dial`, `lever-switch`, `radial-meter`, `red-button`, `radio-buttons` and `tape-buttons`.

## Position: same idea, different era

SPEC-01 owns the light, molded, modern pocket-instrument look, and it reinterprets every standard control. UI95 should not chase that breadth. SPEC-01 reached 61 components in about two days, so a race on count is one UI95 loses (inference from the repo's creation date).

UI95's lane is the hardware of the 70s to 90s, drawn in its existing 1-bit language. Think of bakelite knobs shaded with dither instead of gradients, phosphor and segment readouts, chunky lever toggles, piano-key tape transport buttons, needles that move in steps. No other registry has that look, and UI95 already has the tools for it (dither, CRT shader, stepped motion, synthesized sound).

The second difference is scope. The classic library already covers standard controls. Hardware items should be controls with no good web equivalent, the kind someone installs because they want that one funky thing in an otherwise normal app.

## Keep, change, add

### Keep

- The shadcn registry, the generated docs pipeline (`generate-registry-docs.mjs`), the sound meta pipeline and `npm run verify`.
- The design rules: four inks, no alpha, stepped motion and dither for shading. They are what make UI95 hardware look unlike SPEC-01.
- The sound engine and `/sound-lab`. Knobs and dials are what `step()` detents were built for.
- Every classic item, its URL and its install command. Nothing classic is removed or renamed.

### Change

- **Hardware must not take over the host app's theme.** SPEC-01 scopes everything under one root attribute. That lets a developer drop one knob into a stock shadcn app. UI95 hardware items should do the same, with a scoped root that carries its own inks and no dependency on `theme`.
- **Round is allowed for hardware, drawn as pixels.** Knobs and gauges are round. Extend `check-style.mjs` so hardware items may be round only through stepped pixel circles (`clip-path` polygons as in `avatar`, or SVG with `shape-rendering="crispEdges"`), never `rounded-*`.
- **The base refusal moves from per URL to per item.** Hardware items will not import `radix-ui`, so they can serve `base-*` projects too. The route should refuse only items that need Radix.
- **Hardware items are tagged.** Add `"categories": ["hardware"]` to their registry entries. The docs generator and the catalogue split on it instead of on `type`, since a knob is still a `registry:ui`.

### Add

- A `hardware` foundation item: the scoped root (`<Faceplate>`), its tokens, a `Lamp` LED, and one shared hook for rotary input (pointer drag, wheel, arrow keys, `role="slider"` with `aria-valuenow`). Every round control reuses the hook. `attachSoundSlots` already turns `aria-valuenow` changes into detent ticks for `slider`, so a knob gets its sound by mapping one more `data-slot`.
- A `haptics` lib item wired to the same slot events as sound, with the same opt-in model. The browser technique is public (Vibration API, and the iOS 18 switch-input haptic). Write UI95's own implementation.
- Devices: blocks that compose hardware into a working mini-app on a faceplate with a model plate, published as `registry:block` with their own page.
- An agent install prompt beside the CLI command, and hardware items listed first in `llms.txt`.

## Distribution: keep the shadcn registry

Ship hardware from the existing `@ui95` shadcn registry, under distinct item names, with an agent prompt as a second install path. Do not start an npm package.

| Option | For | Against |
|---|---|---|
| shadcn registry (recommended) | Already built and documented. Users own and restyle the source, which matters for visual one-offs. SPEC-01 shows the model works for hardware. | No semver updates. A user who edits a file has to merge upstream changes by hand. |
| npm package | Versioned updates, one import. | Needs a CSS bundling story and a release process. Hides the source people want to tweak. Splits docs across two install paths. |
| Separate registry (`@ui95-hardware`) | Clean split from classic. | A second registry URL to register, for no gain. Distinct item names already avoid collisions. |

Details:

- Names must not collide with classic items. Use `rotary-knob`, `lever-switch` and so on, never a bare `switch` or `slider`.
- Each hardware item depends on the `hardware` foundation item, not on `theme`. Keep the foundation small so one knob does not pull half a megabyte, unlike SPEC-01's `hardware` item.
- Revisit npm only if people ask for a framework-agnostic build, for example web components.

## First components

Seven controls, drawn from the roadmap's special list where they overlap. Each one is a single PR with its registry item, demo, sounds and roadmap tick.

1. **`rotary-knob`.** A continuous knob with a dithered bakelite cap and a pixel tick ring that turns by drag, wheel or arrow keys, with a detent sound per tick.
2. **`rotary-dial`.** A stepped selector with printed stops around it that clicks from position to position and snaps to the nearest stop on release.
3. **`lever-switch`.** A bat-handle toggle switch that throws between ON and OFF in two frames, with an optional flip-up safety cover.
4. **`radial-meter`.** A needle gauge, such as a VU meter or a speedometer, whose needle moves toward the value in stepped frames with a little overshoot.
5. **`segment-display`.** A seven-segment readout with unlit ghost segments in a dithered ink, for numbers and a small character set.
6. **`tape-buttons`.** A row of piano-key transport buttons where pressing one latches it down and pops the others up. It covers the roadmap's `radio-buttons` too.
7. **`red-button`.** A big domed push button under a hinged guard, with an optional hold-to-confirm ring that fills in steps.

Later candidates from the roadmap and beyond: `crt-player` (built on `crt-screen`), `pov-keyboard`, `hold-to-speak`, a telephone rotary dial for digit input, nixie tubes, a cassette with turning reels, an oscilloscope trace and patch cables.

## Website restructure

The site should open on hardware, keep every existing URL working, and give the classic library its own home.

| Path | Today | After |
|---|---|---|
| `/` | Win95 desktop | Hardware landing: hero device, install, numbered panel grid |
| `/devices/<name>` | None | One page per device |
| `/classic` | None | The Win95 desktop, moved from `/` |
| `/components` | Bento catalogue of everything | Classic catalogue, titled "Classic components" |
| `/components/[name]` | Doc page per item | Unchanged, for hardware and classic items |
| `/docs/*` | Four guides | Hardware getting-started first, classic installation and theming kept |

### Hero

One working device on a faceplate fills the first screen, for example a tape deck built from `tape-buttons`, `segment-display`, `radial-meter` and `rotary-knob`. A visitor can play with it before reading anything. Under it go one line of copy, the CLI command with a copy key, the agent prompt and a sound toggle.

### Catalogue

Below the hero sits a grid of numbered hardware panels, one live demo per panel, in UI95's own plate style. A panel's title links to its `/components/[name]` page. The grid can reuse `ShowcaseCatalogue` filtered by the `hardware` category.

### Nav

The nav order is Hardware (`/`), Devices, Docs, Classic and GitHub. Classic stays one click away, so the library remains easy to find without leading.

### Docs sidebar

The sidebar gets a Hardware group first, then Devices, then the existing Components, Blocks and Utilities groups, relabelled "Classic".

### Copy

`SITE_TAGLINE`, `SITE_DESCRIPTION`, `SITE_KEYWORDS`, the README intro, the OG image and `llms.txt` change to lead with hardware.

## Phased plan

Each step is one small PR that ships on its own and passes `npm run verify`. Steps 1 to 3 add no visible page change, so they can merge while the visuals are still in prototype.

**Phase 0: direction**

1. This doc.

**Phase 1: foundation**

2. Registry plumbing. The docs generator and the catalogue read `categories: ["hardware"]`. A Hardware sidebar group renders only when it has items.
3. `check-style.mjs` rules for hardware: round shapes only through stepped pixel circles, and no `theme` dependency.
4. The `hardware` item: `<Faceplate>` root with scoped tokens, `Lamp` and the shared rotary-input hook, with a showcase demo.

**Phase 2: first components**

5. `rotary-knob`, the first consumer of the rotary hook and the detent sounds.
6. `lever-switch`.
7. `segment-display`.
8. `radial-meter`.
9. `tape-buttons`.
10. `rotary-dial`.
11. `red-button`.
12. The `haptics` lib item, wired into the sound slot events of every item shipped so far.

**Phase 3: site**

13. Move the Win95 desktop from `/` to `/classic`. `/` temporarily shows the hardware catalogue grid.
14. The hardware landing: hero device, install CLI and agent prompt, sound toggle and the numbered panel grid.
15. Nav, sidebar labels, site copy, OG image and `llms.txt`.

**Phase 4: devices and reach**

16. The first device block and its `/devices/<name>` page. It becomes the hero.
17. Serve hardware items to `base-*` projects by refusing per item in `app/r/[style]/[file]/route.ts`.
18. Further devices and the later candidate components, one PR each.

Each component PR follows the README's "Add a component" checklist, and its author checks the component in one light and one dark palette in the browser. Build the first knob as a throwaway prototype before step 4 locks the shared hook's shape, as `ROADMAP.md` already asks for special components.

## Open questions

1. **Accent color.** SPEC-01's lit LEDs and keys use one key color. Should UI95 hardware stay strictly four-ink, or add one `--lamp` accent for LEDs and the red button? The recommended default is one accent token, still with no alpha.
2. **Name.** Does the hardware line ship as "UI95" or under a sub-brand such as "UI95 Hardware", and what does the hero headline say?
3. **The Win95 desktop.** Move it to `/classic` as proposed, or keep it reachable from the new landing as an easter egg, such as a CRT on the hero device that boots into it?
4. **`rotary-dial`.** `ROADMAP.md` says "a rotating dial component". This doc reads it as a stepped selector and lists the telephone dial as a later item. Was the telephone dial the intent?
5. **Sound default on the site.** SPEC-01 plays sound by default with a mute toggle. UI95 sound is opt-in for installers. Should the UI95 site itself play sound by default?
6. **First device.** A tape deck is the proposal. Other options are a synth, a radio or a Geiger counter. Which one sells the line best?
