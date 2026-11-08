type TargetProps = {
  cursorX?: number
  cursorY?: number
  offsetX?: number
  offsetY?: number
  isPressed?: boolean
  hasCursor?: boolean
  className?: string
  children: React.ReactNode
}

export function Target({ cursorX = 0.5, cursorY = 0.5, offsetX = 0, offsetY = 0, isPressed = false, hasCursor = true, className, children }: TargetProps) {
  return (
    <span
      data-focus=""
      data-cursor={hasCursor ? "" : undefined}
      data-cursor-x={cursorX}
      data-cursor-y={cursorY}
      data-cursor-dx={offsetX}
      data-cursor-dy={offsetY}
      data-cursor-pressed={isPressed ? "" : undefined}
      className={className}
      style={{ display: "inline-flex" }}
    >
      {children}
    </span>
  )
}
