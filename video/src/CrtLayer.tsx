import React from "react"
import { AbsoluteFill, continueRender, delayRender, getRemotionEnvironment, interpolate, useCurrentFrame, useVideoConfig } from "remotion"

import { CrtScreen } from "@/components/retro/crt-screen"

const SHADER_SETTLE_MS = 40

export function useShaderSettle(frame: number) {
  React.useLayoutEffect(() => {
    if (!getRemotionEnvironment().isRendering) {
      return
    }
    const handle = delayRender(`CRT shader draw for frame ${frame}`)
    const timeout = window.setTimeout(() => continueRender(handle), SHADER_SETTLE_MS)
    return () => {
      window.clearTimeout(timeout)
      continueRender(handle)
    }
  }, [frame])
}

export function CrtLayer({ children }: { children: React.ReactNode }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  useShaderSettle(frame)

  return (
    <CrtScreen preset="arcade" speed={0} fps={fps} frame={(frame / fps) * 1000} className="absolute inset-0 overflow-hidden bg-black">
      <PowerOn>{children}</PowerOn>
    </CrtScreen>
  )
}

function PowerOn({ children }: { children: React.ReactNode }) {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill className="bg-black">
      <AbsoluteFill
        style={{
          scale: `${interpolate(frame, [0, 6, 12], [0.02, 1, 1], { extrapolateRight: "clamp" })} ${interpolate(frame, [0, 6, 16], [0.004, 0.004, 1], { extrapolateRight: "clamp" })}`,
          filter: `brightness(${interpolate(frame, [0, 10, 30], [6, 3, 1], { extrapolateRight: "clamp" })}) contrast(${interpolate(frame, [0, 30], [1.6, 1], { extrapolateRight: "clamp" })})`,
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.9), rgba(255,255,255,0) 60%)",
          opacity: interpolate(frame, [0, 4, 20], [0, 1, 0], { extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  )
}
