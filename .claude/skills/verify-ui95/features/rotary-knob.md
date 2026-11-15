# Rotary knob

`RotaryKnob` is a Hardware95 part: a matte charcoal skirted or pointer knob with a white indicator line over a printed 0 to 10 scale. It is a `role="slider"` with `data-slot="rotary-knob"`, and its turn is the `--hw-turn` custom property on that element.

## Sub-features

- `knob-drag` dragging up or right turns it up, 220px for the full range, measured from the value at pointer down; Shift is ten times finer.
- `knob-keys` arrows step, Page Up and Page Down move a tenth of the range, Home and End go to the stops.
- `knob-wheel` the wheel moves one step and does not scroll the page.
- `knob-focus` a mouse drag focuses the knob with no focus ring; keyboard use shows the ring.
- `knob-sound` with `<Ui95Sounds />` mounted, `knob.tick` plays once per 5% of travel.
- `knob-disabled` a disabled knob ignores input and leaves the tab order.

## How to get to it (user POV)

- `/hardware/rotary-knob`, the bench (`[data-part="hw-bench"]`): skirted knobs on putty (Volume drives the Clip lamp), pointer knobs on khaki, and coloured caps, a stepped and a disabled knob on cream.
- `/components/rotary-knob` redirects there, and `/hardware` shows the first variant as a tile.

## Driving it with dither.mjs

- Run `node .claude/skills/verify-ui95/dither.mjs journey rotary-knob`. It drags, keys and scrolls the knobs, counts audio buffer plays during a drag, and saves `rest.png` and `volume-max.png`.
- Look at the screenshots. The knobs are matte charcoal with no metallic sheen, the light stays at the top-left while they turn, and the shadow falls bottom-right.

## Gotchas

- The audit skips `[data-hw]`, so palette, radius and motion findings never cover this part. The journey and the screenshots are the proof.
- Sound needs a user gesture to unlock the AudioContext. The journey's first drag is that gesture, so it counts plays on a later drag.
- One run against a cold `next dev` counted 0 plays on the sound step while every other step passed. A rerun and three runs against `next start` counted 4. Prefer `next start` for this journey, and rerun once before you treat a sound miss on `next dev` as a regression.
