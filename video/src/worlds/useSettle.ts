import React from "react"
import { continueRender, delayRender } from "remotion"

const SETTLE_MS = 500

export function useSettleOnMount(label: string) {
  const [handle] = React.useState(() => delayRender(label))
  React.useEffect(() => {
    const timeout = window.setTimeout(() => continueRender(handle), SETTLE_MS)
    return () => {
      window.clearTimeout(timeout)
      continueRender(handle)
    }
  }, [handle])
}
