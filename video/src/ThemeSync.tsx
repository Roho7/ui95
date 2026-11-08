import React from "react"
import { useCurrentFrame } from "remotion"

import { POWER_CLICK_AT, SHOTS, type Theme, WIZARD_AT } from "./timeline"

type Look = { theme: Theme; dark: boolean }

function readLook(frame: number): Look {
  if (frame >= WIZARD_AT) {
    return { theme: "95", dark: false }
  }
  const cut = SHOTS.findLast((shot) => shot.from <= frame) ?? SHOTS[0]
  return { theme: cut.theme, dark: cut.dark }
}

export function ThemeSync() {
  const frame = useCurrentFrame()
  const { theme, dark } = readLook(frame)
  const isCrtSwitchOn = frame >= POWER_CLICK_AT && frame < WIZARD_AT

  React.useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.classList.toggle("dark", dark)
    root.style.colorScheme = dark ? "dark" : "light"
    if (isCrtSwitchOn) {
      root.dataset.crt = "on"
    } else {
      delete root.dataset.crt
    }
  }, [theme, dark, isCrtSwitchOn])

  return null
}
