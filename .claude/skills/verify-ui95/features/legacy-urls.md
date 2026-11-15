# Legacy URLs

UI95 moved from `/components` to `/ui`, and Hardware95 parts moved to `/hardware`. Every old URL redirects permanently.

## Sub-features

- `legacy-components` `/components/<name>` redirects with 308 to `/ui/<name>`, or to `/hardware/<name>` for a `hardware` item, for every item with a docs page.
- `legacy-fixed` `/components` goes to `/ui` and `/docs/theming` goes to `/ui/theming`.
- `markdown` `/ui/<name>.md` and `/hardware/<name>.md` serve the page as markdown.

## Driving it with dither.mjs

- Run `node .claude/skills/verify-ui95/dither.mjs journey legacy-urls`. It reads `/r/registry.json`, requests every old URL without following redirects, and then loads each target.
