const ARROW = [
  "X...........",
  "XX..........",
  "XoX.........",
  "XooX........",
  "XoooX.......",
  "XooooX......",
  "XoooooX.....",
  "XooooooX....",
  "XoooooooX...",
  "XooooooooX..",
  "XoooooXXXXX.",
  "XooXooX.....",
  "XoX.XooX....",
  "XX..XooX....",
  "X....XooX...",
  ".....XooX...",
  "......XX....",
]

const PIXEL = 2

type CursorProps = {
  x: number
  y: number
  isPressed?: boolean
}

export function Cursor({ x, y, isPressed = false }: CursorProps) {
  return (
    <svg
      width={12 * PIXEL}
      height={ARROW.length * PIXEL}
      viewBox={`0 0 12 ${ARROW.length}`}
      shapeRendering="crispEdges"
      style={{ position: "absolute", left: x, top: y, zIndex: 1000, pointerEvents: "none", translate: isPressed ? "0 1px" : undefined }}
    >
      {ARROW.flatMap((row, rowIndex) =>
        [...row].map((cell, columnIndex) =>
          cell === "." ? null : (
            <rect key={`${rowIndex}-${columnIndex}`} x={columnIndex} y={rowIndex} width={1} height={1} fill={cell === "X" ? "#000" : "#fff"} />
          )
        )
      )}
    </svg>
  )
}
