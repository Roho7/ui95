"use client"

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

export type Point = {
  x: number
  y: number
}

export type WindowDrag = {
  position: Point
  isDragging: boolean
  startDrag: (event: ReactPointerEvent<HTMLElement>) => void
}

const DEFAULT_PIXEL = 2

function readPixel(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--pixel")
  const pixel = Number.parseFloat(raw)
  return Number.isFinite(pixel) && pixel > 0 ? pixel : DEFAULT_PIXEL
}

function snapToPixel(value: number, pixel: number): number {
  return Math.round(value / pixel) * pixel
}

export function useWindowDrag(initialPosition: Point): WindowDrag {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const positionRef = useRef(initialPosition)
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => () => stopRef.current?.(), [])

  const startDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return
    }
    event.preventDefault()
    stopRef.current?.()
    const pixel = readPixel()
    const windowElement = event.currentTarget.closest<HTMLElement>("[data-slot='window']") ?? event.currentTarget
    const scale = windowElement.offsetWidth > 0 ? windowElement.getBoundingClientRect().width / windowElement.offsetWidth : 1
    const origin = { x: event.clientX, y: event.clientY, position: positionRef.current }

    function trackPointer(moveEvent: PointerEvent) {
      const next = {
        x: snapToPixel(origin.position.x + (moveEvent.clientX - origin.x) / scale, pixel),
        y: snapToPixel(origin.position.y + (moveEvent.clientY - origin.y) / scale, pixel),
      }
      positionRef.current = next
      setPosition(next)
    }

    function stop() {
      window.removeEventListener("pointermove", trackPointer)
      window.removeEventListener("pointerup", drop)
      window.removeEventListener("pointercancel", drop)
      stopRef.current = null
    }

    function drop() {
      stop()
      setIsDragging(false)
    }

    window.addEventListener("pointermove", trackPointer)
    window.addEventListener("pointerup", drop)
    window.addEventListener("pointercancel", drop)
    stopRef.current = stop
    setIsDragging(true)
  }, [])

  return { position, isDragging, startDrag }
}
