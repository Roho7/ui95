# Direction: from retro component library to Hardware95

UI95 today is a shadcn registry of Win95-style reskins: 57 `registry:ui` items, 5 blocks, a theme and a sound engine. The goal is to sell the retro feel through Hardware95, a line of funky retro hardware controls such as knobs, dials, meters, switches and displays. [SPEC-01](https://spec-01.vercel.app/) does the same for modern pocket-instrument hardware. The classic library stays installable and documented, but the site and the roadmap put Hardware95 first.

This doc covers what SPEC-01 ships and how, what UI95 keeps, changes and adds, the distribution model, the first components, the site restructure and a phased PR plan. The decisions Rohosen made on 2026-11-15 are folded in, and the questions still open are at the end.

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

Hardware95's lane is the hi-fi and lab gear of the 70s to 90s, rendered so it looks real. Think of brushed aluminium faceplates, knurled machined knobs, VU meters behind glass, chrome bat-handle toggles, piano-key tape transport buttons and glowing segment readouts. Each one has a material, takes light from one direction, casts a shadow and answers a press or a turn with travel, a click and a sound. It is not flat pixel art. The pixel look stays with the classic library.

The second difference is scope. The classic library already covers standard controls. Hardware95 items are controls with no good web equivalent, the kind someone installs because they want that one tactile thing in an otherwise normal app.

## Keep, change, add

### Keep

- The shadcn registry, the generated docs pipeline (`generate-registry-docs.mjs`), the sound meta pipeline and `npm run verify`.
- The sound engine and `/sound-lab`. Knobs and dials are what `step()` detents were built for.
- Every classic item, its URL and its install command, and the classic design rules in [`DESIGN.md`](DESIGN.md) for those items. Nothing classic is removed or renamed.

### Change

- **Hardware95 has its own visual rules.** The classic rules (four inks, no alpha, no gradients, square corners, stepped motion) do not apply to it. Hardware95 uses one light source from the top-left, layered shadows that agree with it, materials built from gradients and highlights, and motion that behaves like the physical part. A knob cap follows the pointer with no easing, a needle swings and settles, a key travels down and springs back, and an LED switches on at once.
- **Hardware95 has one accent.** A `--hw-lamp` token colors lit LEDs and the red button. Everything else is material: metal, plastic, glass and paint.
- **Hardware95 must not take over the host app's theme.** SPEC-01 scopes everything under one root attribute. That lets a developer drop one knob into a stock shadcn app. Every Hardware95 part carries its own scoped tokens and has no dependency on `theme`.
- **`check-style.mjs` splits by line.** The classic class rules apply to classic directories only. Hardware95 items get their own checks, which say that they depend on `@ui95/hardware` and never on `@ui95/theme`.
- **The base refusal moves from per URL to per item.** Hardware95 items will not import `radix-ui`, so they can serve `base-*` projects too. The route should refuse only items that need Radix.
- **Hardware95 items are tagged.** Add `"categories": ["hardware"]` to their registry entries. The docs generator and the catalogue split on it instead of on `type`, since a knob is still a `registry:ui`.
- **The Win95 desktop becomes a block.** It stops being the home page and ships as an installable `registry:block`, like shadcn's ready-made blocks.

### Add

- A `hardware` foundation item: scoped tokens, a `Faceplate` in a few finishes and a `Lamp` LED.
- One shared rotary-input hook (pointer drag, wheel, arrow keys, `role="slider"` with `aria-valuenow`). It ships with `rotary-knob` first and moves to a shared file when `rotary-dial` becomes its second caller. `attachSoundSlots` already turns `aria-valuenow` changes into detent ticks for `slider`, so a knob gets its sound by mapping one more `data-slot`.
- A `haptics` lib item wired to the same slot events as sound, with the same opt-in model. The browser technique is public (Vibration API, and the iOS 18 switch-input haptic). Write UI95's own implementation.
- Devices: blocks that compose Hardware95 parts into a working mini-app on a faceplate with a model plate, published as `registry:block` with their own page. The first is a tape deck.
- An agent install prompt beside the CLI command, and Hardware95 items listed first in `llms.txt`.

## Distribution: keep the shadcn registry

Ship Hardware95 from the existing `@ui95` shadcn registry, under distinct item names, with an agent prompt as a second install path. Do not start an npm package.

| Option | For | Against |
|---|---|---|
| shadcn registry (recommended) | Already built and documented. Users own and restyle the source, which matters for visual one-offs. SPEC-01 shows the model works for hardware. | No semver updates. A user who edits a file has to merge upstream changes by hand. |
| npm package | Versioned updates, one import. | Needs a CSS bundling story and a release process. Hides the source people want to tweak. Splits docs across two install paths. |
| Separate registry (`@hardware95`) | Clean split from classic. | A second registry URL to register, for no gain. Distinct item names already avoid collisions. |

Details:

- Names must not collide with classic items. Use `rotary-knob`, `lever-switch` and so on, never a bare `switch` or `slider`.
- Each Hardware95 item depends on the `hardware` foundation item, not on `theme`. Keep the foundation small so one knob does not pull half a megabyte, unlike SPEC-01's `hardware` item.
- Each item ships its styles as a plain CSS file next to its component, scoped to `[data-hw]`. Realistic materials need layered gradients and shadow stacks that read badly as Tailwind arbitrary values, and a CSS file keeps them editable.
- Revisit npm only if people ask for a framework-agnostic build, for example web components.

## First components

Seven controls, drawn from the roadmap's special list where they overlap. Each one is a single PR with its registry item, demo, sounds, roadmap tick and screenshots. Each must look like a photographed part at rest and feel like one under the pointer.

1. **`rotary-knob`.** A machined aluminium knob with a knurled grip over a printed scale. It turns by drag, wheel or arrow keys. The lighting on the cap stays put while the grip and the pointer line turn, and each step clicks.
2. **`rotary-dial`.** A rotating stepped selector, a knob with detents over printed positions. It clicks from stop to stop, snaps to the nearest stop on release and plays a heavier click than the knob.
3. **`lever-switch`.** A chrome bat-handle toggle that snaps between ON and OFF, with an optional flip-up safety cover.
4. **`radial-meter`.** A VU meter behind glass with a backlit cream scale. The needle swings toward the value, overshoots a little and settles.
5. **`segment-display`.** A seven-segment readout behind a smoked window, with faint unlit segments and a glow on lit ones.
6. **`tape-buttons`.** A row of piano-key transport keys with a mechanical interlock. Pressing one latches it down and pops the others up. It covers the roadmap's `radio-buttons` too.
7. **`red-button`.** A big domed red button under a hinged guard, with an optional hold-to-confirm ring.

Later candidates from the roadmap and beyond: `crt-player` (built on `crt-screen`), `pov-keyboard`, `hold-to-speak`, nixie tubes, a cassette with turning reels, an oscilloscope trace and patch cables.

## Website restructure

The site opens on Hardware95 and keeps every existing URL working. The Win95 desktop leaves the home page and becomes a block.

| Path | Today | After |
|---|---|---|
| `/` | Win95 desktop | Hardware95 landing: tape deck hero, install, numbered panel grid |
| `/devices/<name>` | None | One page per device, starting with `/devices/tape-deck` |
| `/components` | Bento catalogue of everything | Classic catalogue, titled "Classic components" |
| `/components/[name]` | Doc page per item | Unchanged, for Hardware95 and classic items. `/components/win95-desktop` shows the desktop block. |
| `/docs/*` | Four guides | Hardware95 getting-started first, classic installation and theming kept |

### Hero

The tape deck fills the first screen, built from `tape-buttons`, `segment-display`, `radial-meter` and `rotary-knob`. A visitor can play with it before reading anything. Under it go one line of copy, the CLI command with a copy key, the agent prompt and a sound toggle. The site plays sound by default, and the toggle mutes it. Installers still opt in to sound in their own apps.

### Catalogue

Below the hero sits a grid of numbered Hardware95 panels, one live demo per panel. A panel's title links to its `/components/[name]` page. The grid can reuse `ShowcaseCatalogue` filtered by the `hardware` category.

### Nav

The nav order is Hardware95 (`/`), Devices, Docs, Classic (`/components`) and GitHub. Classic stays one click away, so the library remains easy to find without leading.

### Docs sidebar

The sidebar gets a Hardware95 group first, then Devices, then the existing Components, Blocks and Utilities groups, relabelled "Classic".

### Copy

`SITE_TAGLINE`, `SITE_DESCRIPTION`, `SITE_KEYWORDS`, the README intro, the OG image and `llms.txt` change to lead with Hardware95.

## Phased plan

Each step is one small PR that ships on its own and passes `npm run verify`. Component PRs carry screenshots of the new part.

**Phase 0: direction**

1. This doc.

**Phase 1: foundation**

2. The `hardware` item. It adds the `hardware` category to the docs generator and a Hardware95 sidebar group, the `check-style.mjs` split, scoped tokens, `Faceplate` and `Lamp`, with a showcase demo.
3. `rotary-knob`, with the rotary-input hook and a detent sound.

**Phase 2: first components**

4. `rotary-dial`. Its rotary hook moves into a shared file.
5. `lever-switch`.
6. `segment-display`.
7. `radial-meter`.
8. `tape-buttons`.
9. `red-button`.
10. The `haptics` lib item, wired into the sound slot events of every item shipped so far.

**Phase 3: site**

11. The Win95 desktop as a `win95-desktop` `registry:block`, with its demo. `/` keeps rendering it until the next step.
12. The Hardware95 landing on `/`: install CLI and agent prompt, sound on by default with a mute toggle, and the numbered panel grid.
13. Nav, sidebar labels, Hardware95 copy, OG image and `llms.txt`.

**Phase 4: devices and reach**

14. The `tape-deck` device block and its `/devices/tape-deck` page. It becomes the hero.
15. Serve Hardware95 items to `base-*` projects by refusing per item in `app/r/[style]/[file]/route.ts`.
16. Further devices and the later candidate components, one PR each.

Each component PR follows the README's "Add a component" checklist, and its author checks the component in the browser on every `Faceplate` finish.

## Open questions

1. **Registry name and domain.** The default is to keep the `@ui95` namespace and `ui95.dev`, with Hardware95 as the name of the line. Should Hardware95 get its own domain or registry namespace instead?
