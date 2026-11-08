import "./styles.css"
import "./fonts"
import "./setup"

import { Composition } from "remotion"

import { Showcase } from "./Showcase"
import { TOTAL_FRAMES } from "./timeline"

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="UI95Showcase"
      component={Showcase}
      durationInFrames={TOTAL_FRAMES}
      fps={60}
      width={1920}
      height={1080}
      defaultProps={{
        installCommand: "npx shadcn@latest add https://www.ui95.dev/r/theme.json",
        roomToneVolume: 0.08,
        crtBuzzVolume: 0.3,
      }}
    />
  )
}
