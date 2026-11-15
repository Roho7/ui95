# Landing: boot the machine

`/` is a beige computer on a desk, built from Hardware95 parts (`crt-monitor`, `rotary-knob`, `lamp`). It starts off. Pressing POWER warms up the CRT, runs a short boot text and boots the live UI95 desktop inside the screen. The Bright and Curve knobs drive the CRT. Two lit keys lead to `/ui` and `/hardware`.

## Driving it with dither.mjs

- Run `node .claude/skills/verify-ui95/dither.mjs journey landing`. It saves `off.png`, `booting.png` and `on.png`.
- Under reduced motion, POWER goes straight to the desktop with no warm-up or boot text.
