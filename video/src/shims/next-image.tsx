import React from "react"
import { Img } from "remotion"

type ImageProps = React.ComponentProps<"img"> & { fill?: boolean; priority?: boolean; quality?: number; placeholder?: string }

const NEXT_ONLY = ["fill", "priority", "quality", "placeholder"] as const

export default function Image(props: ImageProps) {
  const imageProps: Record<string, unknown> = { ...props }
  NEXT_ONLY.forEach((key) => delete imageProps[key])
  const style = props.fill ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%", ...props.style } : props.style
  return <Img {...(imageProps as React.ComponentProps<typeof Img>)} style={style} />
}
