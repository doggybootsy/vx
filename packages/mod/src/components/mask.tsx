type Masks = "none" | "avatar-overlay" | "squircle";

function createMaskURL<T extends Masks>(mask: T): T extends "none" ? "" : `url(#vx-${T}-mask)` {
  if (mask === "none") return "" as any;
  return `url(#vx-${mask}-mask)` as any;
}

export function Mask({ width, height, mask, children, className }: { mask: Masks, width: number, height: number, children: React.ReactElement, className?: string }) {
  return (
    <svg
      height={height}
      width={width}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <foreignObject
        mask={createMaskURL(mask)}
        height={height}
        width={width}
        x={0}
        y={0}
      >
        {children}
      </foreignObject>
    </svg>
  )
}