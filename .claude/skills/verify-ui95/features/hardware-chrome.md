# Hardware95 chrome and the library split

Hardware95 pages render in their own physical chrome under `app/(hardware)`: a putty masthead with lit keys, a parts index with pilot lamps, and a charcoal bench for demos. UI95 pages keep the Win95 program window under `app/(ui95)`. `docs/SITE.md` has the plan.

## Sub-features

- `hw-no-win95` no taskbar, menubar, window or CRT overlay under `/hardware`, and no pixel font on the heading.
- `hw-redirects` `/components/<hardware part>` redirects permanently to `/hardware/<part>`.
- `hw-index` the parts index lights the current part's lamp, and the Parts key is lit.
- `ui95-without-hardware` the UI95 sidebar and catalogue list no Hardware95 parts, and the menubar links to Hardware95.
- `llms` `llms.txt` lists Hardware95 parts under their own heading at their new URLs.

## Driving it with dither.mjs

- Run `node .claude/skills/verify-ui95/dither.mjs journey hardware-chrome`. It saves `rotary-knob.png` and `catalogue.png`.
