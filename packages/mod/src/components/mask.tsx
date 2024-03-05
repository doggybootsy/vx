type masks = "none" | "avatar-overlay" | "squircle";

function createMaskURL(mask: masks) {
  if (mask === "none") return "";
  return `url(#vx-${mask}-mask)`;
}

export function Mask({ width, height, mask, children }: { mask: masks, width: number, height: number, children: React.ReactElement }) {
  return (
    <svg
      height={height}
      width={width}
      viewBox={`0 0 ${width} ${height}`}
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