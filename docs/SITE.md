# Site: one machine, two libraries

This doc plans how ui95.dev splits into two libraries and how one landing page connects them. It replaces the website restructure, phased plan and open questions that used to be in [`DIRECTION.md`](DIRECTION.md). The [aesthetic](DIRECTION.md#aesthetic) and component specs there still apply.

Today a Hardware95 page renders inside the Win95 program window: pixel title bar, pixel sidebar, Start taskbar, phosphor palette and a CRT filter over everything. Matte beige panels inside 1-bit pixel chrome look like two products pasted together. The fix is to give each library its own chrome, and to tell one story that explains why both exist.

## The story: hardware builds the computer, UI95 runs on it

- **Hardware95 is the machine.** It covers knobs, switches, lamps, meters, keys and displays, and later the case, the monitor and the devices on the desk. It is physical gear in matte beige plastic.
- **UI95 is the software on that machine's screen.** It covers windows, menus, buttons, the taskbar and the desktop. It is what boots when the machine powers on.

The site shows this order literally. The landing page is a beige computer on a desk. Press its power button and its CRT warms up and boots into the UI95 desktop. From there, the visitor either goes into the screen (UI95) or opens the case (Hardware95). Every page after that sits on one side of the glass:

| | Hardware95 | UI95 |
|---|---|---|
| What it is | The physical machine | The software on its screen |
| Chrome | Beige equipment panel, printed legends, lit push-buttons, pilot lamps | Win95 program window, pixel type, taskbar, palettes, optional CRT filter |
| Look rules | [Aesthetic](DIRECTION.md#aesthetic), `[data-hw]` tokens | [`DESIGN.md`](DESIGN.md), four inks, dither |
| Lives at | `/hardware` | `/ui` |

The shared manual at `/docs` sits between them. It is the operator's manual that ships with the machine.

## Organization

### One Next app, one root layout, three chromes

Recommendation: keep one Next app with one minimal root layout. Give each side its own route group and chrome layout.

| Option | For | Against |
|---|---|---|
| **One root layout, route groups per chrome (recommended)** | Client-side navigation between sides, so the landing can zoom into either library without a reload. One registry route, one sound engine, one search index, one `llms.txt`. The landing hosts both kinds of part, which works without extra setup because Hardware95 is already scoped to `[data-hw]`. | The root layout must stay free of anything visual, and a check has to keep it that way. |
| Multiple root layouts, one per side | Strongest isolation, with separate `<html>`, fonts and scripts per side. | Next does a full page load when crossing root layouts (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`), so the boot-to-desktop transition breaks. Every side duplicates its metadata, and a global 404 needs the `globalNotFound` flag. |
| Two apps or two domains | Clean ownership and separate deploys. | Two registries, two installs and two sites to keep in sync. The story is one machine, so splitting it in two works against it. |

Isolation is cheap here because the two sides barely collide. Hardware95 styles live under `[data-hw]` and ignore the shadcn tokens on `:root`. What leaks today comes from `app/layout.tsx`, which puts these on every page:

- the Win95 fonts (Silkscreen and VT323) on `<html>`,
- `RESTORE_PALETTE_SCRIPT`, which sets `data-theme` on `<html>`,
- `<CrtSite />`, a fullscreen CRT filter over the whole document,
- the body background and text color from `globals.css`.

Move all four into the UI95 group layout. The root layout keeps only `<html>`, `<body>`, `globals.css`, `ThemeProvider` and `<Ui95Sounds />`. Sound is shared by both libraries, so it stays at the root. The machine layout loads the Win95 fonts too, because the UI95 desktop runs inside its CRT.

```text
app/
├── layout.tsx                 html, body, globals.css, ThemeProvider, Ui95Sounds. Nothing visual.
├── (machine)/
│   ├── layout.tsx             full-bleed desk scene, no nav chrome
│   └── page.tsx               /  the landing
├── (hardware)/
│   ├── layout.tsx             beige panel chrome
│   └── hardware/
│       ├── page.tsx           /hardware               parts catalogue
│       ├── [name]/page.tsx    /hardware/<part>
│       ├── devices/[name]/    /hardware/devices/<device>
│       └── materials/         /hardware/materials     finishes and tokens
├── (ui95)/
│   ├── layout.tsx             Win95 fonts, palette script, CrtSite, program window
│   └── ui/
│       ├── page.tsx           /ui                     the desktop, then the catalogue
│       ├── [name]/page.tsx    /ui/<component>
│       └── theming/           /ui/theming             palettes and inks
├── (manual)/
│   ├── layout.tsx             paper manual chrome
│   └── docs/                  /docs, /docs/installation, /docs/registry, /docs/sound, /docs/haptics
├── r/[style]/[file]/          registry, unchanged
├── md/[library]/[name]/       markdown per page, for agents
└── sitemap.ts, robots.ts, llms.txt, llms-full.txt
```

### Routes

| Path | Chrome | Content |
|---|---|---|
| `/` | Machine | The landing |
| `/hardware` | Hardware | Parts catalogue, laid out as a flat lay like reference 1 |
| `/hardware/<part>` | Hardware | One page per part: bench demo, install, API, sounds |
| `/hardware/devices/<device>` | Hardware | Devices built from parts, starting with `tape-deck` |
| `/hardware/materials` | Hardware | Finishes, tokens, light and shadow recipes |
| `/ui` | UI95 | The live Win95 desktop, with the component catalogue below it |
| `/ui/<component>` | UI95 | One page per component or block |
| `/ui/theming` | UI95 | Palettes, inks, pixel scale |
| `/docs` | Manual | What the two libraries are and how they fit |
| `/docs/installation`, `/docs/registry` | Manual | Registry setup, the CLI, the agent prompt and package managers. Each side's catalogue links here. |
| `/docs/sound`, `/docs/haptics` | Manual | Shared engines, with per-component sound keys listed on each component page |

Old URLs keep working through permanent redirects in `next.config.ts`, generated from `registry.json`:

- `/components` goes to `/ui`.
- `/components/<name>` goes to `/ui/<name>` or `/hardware/<name>`, depending on the item's library.
- `/docs/theming` goes to `/ui/theming`.
- `/md/components/<name>` goes to `/md/<library>/<name>`.

### Shared docs

The manual holds anything that applies to both sides: install, registry namespace, the agent prompt, sound and haptics. It gets a third, deliberately plain chrome. Picture a printed operator's manual: off-white paper, a condensed sans for headings, a typewriter face for body text and a contents column. It is the cheapest of the three to build, and it never pretends to be either side. Theming does not belong in the manual, because the two sides theme differently. UI95 has palettes and inks at `/ui/theming`, and Hardware95 has finishes and tokens at `/hardware/materials`.

### Registry

Keep one registry and one namespace, `@ui95/<name>`, so nobody's install breaks. Item names are already unique across both sides.

```ts
type Library = "hardware95" | "ui95" | "shared"
```

- Every item carries exactly one library category: `"hardware"`, `"ui"` or `"shared"`. A script adds `"ui"` to every classic item. `check-style.mjs` fails on an item with none or with more than one.
- `shared` covers effects and engines that both sides use: `sound`, `haptics`, `crt-screen`, `shader-mount` and `use-prefers-reduced-motion`. Today `crt-screen` reaches `theme` through `shader-mount` and then `dither-inks`. `crt-screen` itself uses no theme tokens, and `dither-inks` is a color probe that reads custom properties. The PR that moves these to `shared` confirms that no theme token is read, then drops the dependency. That lets a Hardware95 monitor use the CRT.
- The docs generator stores `library` on each `RegistryDoc`, and `docHref(doc)` returns `/hardware/<name>` or `/ui/<name>` from it. Sidebar groups, search, sitemap and `llms.txt` group by library first.

### Code folders

```text
components/
├── ui/              UI95 primitives (shadcn reskins)
├── retro/           UI95 compositions: window, taskbar, terminal, crt-screen
├── blocks/          UI95 blocks, starting with win95-desktop (from app/_demo)
├── hardware/        Hardware95 parts, one .tsx and .css each
│   └── devices/     Hardware95 devices, starting with tape-deck
├── chrome/
│   ├── ui95/        program window, menubar, taskbar, theme controls, CrtSite (from app/_site)
│   ├── hardware/    panel nav, part index, bench, readouts
│   └── manual/      paper page, contents
├── docs/            chrome-neutral page content: API tables, install commands, page neighbours
└── showcase/        demos per registry item
```

`components/docs` imports UI95 primitives in 8 of its 19 files today, for example Tabs in the demo preview. Split each one into data and look. The data part (API rows, install commands, neighbours) stays in `components/docs`, and each chrome renders it in its own style. Hardware pages never import `components/ui`, and `check-style.mjs` enforces that.

## Showcase: the landing

### Concept A: Boot the machine (recommended)

A beige desktop computer sits on a desk in soft studio light. The monitor is a Hardware95 part with a charcoal bezel, a curved CRT and a model badge. Below the screen sit a power push-button with a pilot lamp, a segment-display clock and two knobs labelled BRIGHTNESS and VOLUME.

1. **Off.** The screen is dark glass with a faint reflection, and the power lamp pulses slowly.
2. **Power on.** The visitor presses POWER. The button travels down and clicks, the lamp lights, and the CRT warms up from a bright dot to a rolling raster. A short boot text runs, then the UI95 desktop appears inside the screen.
3. **Live.** The desktop inside the CRT is the real `win95-desktop` block, so its windows drag and its menus open. The knobs on the monitor drive real state. BRIGHTNESS changes the CRT shader, and VOLUME sets the site's sound level. The hardware visibly controls the software.
4. **Choose a side.** Two big lit push-buttons below the monitor read SOFTWARE · UI95 and HARDWARE · HARDWARE95. A visitor can also go straight in. Clicking inside the screen and choosing "Enter UI95" grows the screen to fill the viewport, which lands on `/ui` with the same desktop. Clicking the case opens it, and the parts fly out into the `/hardware` flat lay. Both moves use the View Transitions API where it exists, and plain navigation everywhere else.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  HARDWARE95 · UI95 SYSTEM                        ( MANUAL )  ( GITHUB )  │
│                                                                          │
│           ┌──────────────────────────────────────────┐                   │
│           │ ┌──────────────────────────────────────┐ │                   │
│           │ │ UI95 desktop, live inside the CRT    │ │                   │
│           │ │ ┌─ README.TXT ┐  ┌─ Paint ──┐        │ │   ┌────────────┐  │
│           │ │ │             │  │          │        │ │   │ TAPE DECK  │  │
│           │ │ └─────────────┘  └──────────┘        │ │   │ >  []  <<  │  │
│           │ │ [Start]|______________________| 12:48│ │   └────────────┘  │
│           │ └──────────────────────────────────────┘ │   later, on       │
│           │  (●) POWER  [12:48]  ◐ BRIGHT  ◐ VOL     │   the desk        │
│           │                                          │                   │
│           └──────────────────────────────────────────┘                   │
│                               │    │                                     │
│       ┌──────────────────────────────────────────────────┐               │
│       │  [kbd] keyboard (Hardware95 keys, later)         │               │
│       └──────────────────────────────────────────────────┘               │
│                                                                          │
│       ┏━━━━━━━━━━━━━━━━━━━━┓          ┏━━━━━━━━━━━━━━━━━━━━━━━━┓         │
│       ┃  SOFTWARE · UI95   ┃          ┃ HARDWARE · HARDWARE95  ┃         │
│       ┗━━━━━━━━━━━━━━━━━━━━┛          ┗━━━━━━━━━━━━━━━━━━━━━━━━┛         │
│       Win95 components for shadcn     Knobs, lamps, meters, switches     │
│       npx shadcn add @ui95/window     npx shadcn add @ui95/rotary-knob   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

On a phone the monitor fills the width, the controls stack below it, and the desktop inside the CRT runs at its mobile layout.

This concept wins because it acts out the story instead of describing it. It reuses parts that already exist or are already planned: `crt-screen`, `win95-desktop`, lamps, knobs, a push-button and a segment display. Every part in the hero is also installable, so the hero doubles as a demo of both libraries.

### Concept B: Knolling to assembly

The page opens on a flat lay of loose parts, like reference 1: a CRT tube, a keyboard, panels, knobs and lamps. Scrolling assembles them into the computer, and the last frame boots the screen into UI95. It tells the story well, but scroll choreography is expensive to build and tune, it is hard to make good on a phone, and the visitor watches instead of touching. Use the flat lay as the look of the `/hardware` catalogue instead.

### Concept C: The workbench patch

A split screen shows a beige bench of live parts on the left and a UI95 desktop on the right. A patch cable connects a hardware knob to a UI95 slider, and the two move together. It is the cheapest concept and it shows that the two sides interoperate. It also reads as two products side by side, and it never shows hardware building a computer.

### Social card (later)

The site's main OG image becomes a tilted isometric wall of real component tiles, like the SPEC-01 card: knobs, lamps, meters, segment displays, switches and buttons, plus UI95 windows where they fit. A big thin title lockup in the style of "UI95/HARDWARE" sits bottom-left. It uses the matte beige palette and soft top-left light, not SPEC-01's white. The tiles are renders of the real components, not drawings, so the card is built once enough parts exist (step 20).

## Docs page layouts

### Hardware95 part page

The page is an equipment panel, not a program window. It has no pixel type, no taskbar and no palette switcher.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ ● HARDWARE95  [PARTS] [DEVICES] [MATERIALS]  [MANUAL]  [UI95 →] [SND]      │
├───────────────┬────────────────────────────────────────────────────────────┤
│ PARTS         │  ROTARY KNOB                                    MODEL HW-2 │
│ ○ Foundation  │  Matte charcoal knob over a printed scale.                 │
│ ● Rotary knob │ ┌────────────────────────────────────────────────────────┐ │
│ ○ Rotary dial │ │ bench: a darker work surface                           │ │
│ ○ Lever switch│ │   ┌────────────────────────────────────────────┐       │ │
│ ○ Meter       │ │   │  ◉ VOLUME   ◉ BASS   ◉ TREBLE   (●) CLIP   │       │ │
│ ○ Segment     │ │   └────────────────────────────────────────────┘       │ │
│ ○ Tape keys   │ │                                                        │ │
│ ○ Red button  │ │ [SKIRTED] [POINTER] [CAPS]   finish: PUTTY CREAM       │ │
│               │ └────────────────────────────────────────────────────────┘ │
│ DEVICES       │                                                            │
│ ○ Tape deck   │  INSTALL ▕ npx shadcn add @ui95/rotary-knob ▏ [COPY]       │
│               │ ┌────────────────────────────────────────────────────────┐ │
│ MATERIALS     │ │ code: charcoal well, phosphor text                     │ │
│               │ └────────────────────────────────────────────────────────┘ │
│               │                                                            │
│               │  SPEC SHEET   prop · type · default, a printed table       │
│               │  SOUNDS       knob.tick                                    │
└───────────────┴────────────────────────────────────────────────────────────┘
```

- Nav items are square lit push-buttons, and the current section stays lit. The part index on the left marks the current page with a lit pilot lamp.
- Variant switches are tape-buttons once that part exists, and plain printed tabs until then. The finish picker restyles the bench faceplate live.
- The install command sits in a recessed readout with a COPY key. Code sits in a charcoal well. The API table is a printed spec sheet.

### UI95 component page

The UI95 page keeps today's program window, with three changes:

- Hardware95 leaves the sidebar.
- The menubar gains Manual and Hardware95 links.
- `/ui` opens on the live desktop.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ UI95                                                                 _ o X │
├────────────────────────────────────────────────────────────────────────────┤
│ Docs  Components  Desktop  Hardware95 →          [Search] [Phosphor v] [*] │
├─────────────────┬──────────────────────────────────────────────────────────┤
│ GETTING STARTED │ DOCS / COMPONENTS / BUTTON                   [COPY PAGE] │
│  Installation ↗ │ BUTTON                                                   │
│  Theming        │ ══ EXAMPLES ════════════════════════════════════════════ │
│ COMPONENTS      │ [PREVIEW][CODE]                                          │
│  Accordion      │ ┌─────────────────────────────────────────────────────┐  │
│  Alert          │ │ A DEFAULT   B OUTLINE   C GHOST   ...               │  │
│  ...            │ └─────────────────────────────────────────────────────┘  │
│ BLOCKS          │                                                          │
│  Win95 desktop  │ ══ INSTALLATION ════════════════════════════════════════ │
│                 │                                                          │
│                 │ ══ API REFERENCE ═══════════════════════════════════════ │
│                 │                                                          │
├─────────────────┴──────────────────────────────────────────────────────────┤
│ [START] [UI95]                                                       12:48 │
└────────────────────────────────────────────────────────────────────────────┘
```

### Manual page

```text
┌────────────────────────────────────────────────────────────┐
│  OPERATOR'S MANUAL · HARDWARE95 / UI95           ← machine │
├───────────────┬────────────────────────────────────────────┤
│ CONTENTS      │  2. Installation                           │
│ 1. The system │  Register the namespace once. Both         │
│ 2. Install    │  libraries install from it.                │
│ 3. Registry   │  ▕ npx shadcn registry add @ui95=… ▏       │
│ 4. Sound      │  2.1 UI95 needs the theme ...              │
│ 5. Haptics    │  2.2 Hardware95 needs nothing else ...     │
└───────────────┴────────────────────────────────────────────┘
```

## PR plan

Each PR ships on its own and ends in a check. The split comes first because the clash is the current problem. The next components follow once the hardware chrome exists, so their screenshots show the right chrome. The landing comes last, because it is built from those parts.

**Phase 1: split the site**

1. **This plan.**
2. **Library model.** Add `Library` and a category on every registry item (a script adds `"ui"` to classic items), `RegistryDoc.library` and a `docHref(doc)` that reads it. Add a `check-style.mjs` rule that every item has exactly one library. URLs and visuals do not change. Check that the generator output is the same apart from the new field.
3. **Empty the root layout.** Move the Win95 fonts, palette script, `CrtSite` and body styles from `app/layout.tsx` into an `(ui95)` group layout, and move today's pages into that group. Add a check that `app/layout.tsx` imports only `globals.css`, `ThemeProvider` and `Ui95Sounds`. URLs do not change. Check with before and after screenshots of `/`, `/components/button` and `/components/rotary-knob`.
4. **Hardware chrome.** Add the `(hardware)` group, `/hardware`, `/hardware/<part>`, the beige panel chrome and its chrome-neutral docs widgets. Redirect `/components/hardware` and `/components/rotary-knob` to their new pages, and remove Hardware95 from the Win95 sidebar. This PR fixes the screenshot Rohosen flagged. Check with screenshots of both hardware pages and a test that no element under `/hardware` comes from `components/chrome/ui95`.
5. **UI95 routes.** Move `/components` to `/ui`, `/components/<name>` to `/ui/<name>` and `/docs/theming` to `/ui/theming`, with redirects generated from `registry.json`. Check with a script that requests every old URL and expects a 308 to the right new one.
6. **The manual.** Add the `(manual)` group with paper chrome at `/docs`: the system overview, installation and registry, the agent prompt and sound. `sitemap.ts`, `llms.txt` and `llms-full.txt` group by library. Check that `llms.txt` lists every registry item under exactly one library.

**Phase 2: parts, in the hardware chrome**

7. `rotary-dial`. The rotary hook moves into `components/hardware/use-rotary-input.ts`, shared with `rotary-knob`.
8. `lever-switch`.
9. `segment-display`.
10. `radial-meter`.
11. `tape-buttons`. The hardware pages adopt them for variant switches.
12. `red-button`. It also provides the square lit push-button that the landing and the hardware nav use.
13. `haptics`. A `shared` lib wired into the sound slot events, documented at `/docs/haptics`.

**Phase 3: the computer**

14. **`win95-desktop` block.** Move `app/_demo` and `app/_site/Taskbar` into `components/blocks/win95-desktop` as a UI95 `registry:block`. `/ui` opens on it.
15. **Shared effects.** Move `crt-screen`, `shader-mount` and `use-prefers-reduced-motion` to `shared`, and drop the theme dependency once the code confirms that nothing reads a theme token.
16. **`crt-monitor` part.** A Hardware95 monitor housing with a charcoal bezel, curved glass, a reflection and a model badge. It hosts any children through `crt-screen` and adds BRIGHTNESS and POWER controls.
17. **The landing.** Add the `(machine)` group at `/` with Concept A: power-on boot, the live `win95-desktop` inside `crt-monitor`, knobs wired to the CRT and to volume, and the two entry buttons. A journey checks power-on, that the desktop is interactive inside the screen, and that each entry button reaches its library.
18. **`tape-deck` device.** Build it from `tape-buttons`, `segment-display`, `radial-meter` and `rotary-knob`, at `/hardware/devices/tape-deck`. It also sits on the landing desk.
19. **Copy and reach.** Per-library titles, descriptions and OG images, the README, and serving Hardware95 items to `base-*` projects by refusing per item in `app/r/[style]/[file]/route.ts`.
20. **Main OG image.** Generate the isometric wall from the real components once at least six Hardware95 parts ship. A Playwright script screenshots each demo tile against the beige background, and a compose step tilts the grid and adds the title, writing a static `opengraph-image.png`. `next/og` is the fallback. Its renderer supports only a subset of CSS, so the layered gradients and SVG shading probably won't survive (inferred, not tested). Check by comparing the card with live screenshots of the same tiles.

## Open questions for Rohosen

1. **Domain and namespace.** Keep `@ui95` and ui95.dev for both libraries, which is the default and fits the one-machine story? Or give Hardware95 its own domain or namespace, such as hardware95.dev and `@hardware95`, at the cost of a second registry for people to register?
2. **Umbrella name.** What does the landing call the whole system? The default badge reads "HARDWARE95 · UI95 SYSTEM", with UI95 kept as the site name. Another option is a new name for the machine itself, with the two libraries as its parts.
3. **Boot on load or on press.** The default waits for the visitor to press POWER, with a pulsing lamp. Browsers only allow sound after a gesture, so a press also unlocks the boot sound. The alternative boots silently on load, so the desktop is visible at once.
4. **A third look for the manual.** The default is a plain printed-manual chrome for shared docs. The alternative mounts the shared guides inside both sides, so there are two copies of each page and no third look.
