import { useCallback, useMemo, useRef } from "react";
import { ReactSpring } from "@webpack/common";

type SpeedFunction = (isRevealing: boolean, gap: number, div: HTMLDivElement) => number;

interface TextOverflowScrollerProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  /**
   * @note Pixels per-second
   * @note {Infinity} is instant | {0} is dont move
   */
  speed?: number | SpeedFunction,
  divRef?: React.ForwardedRef<HTMLDivElement>
}

const defaultSpeed: SpeedFunction = (isRevealing, gap, div) => {
  // Have it go twice as fast on the way back
  const speed = isRevealing ? 75 : 150;

  // If the width is less than or equal to the gap go even faster
  // This is because it will show the full content when its done
  if (Math.max(div.clientWidth, div.offsetWidth) >= gap) return speed * 2;
  return speed;
};

export function TextOverflowScroller(props: TextOverflowScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [ { x }, set ] = ReactSpring.useSpring(() => ({
    immediate: false,
    x: 0,
    onChange(distance: number) {
      if (ref.current) ref.current.scroll(distance, 0);
    },
    config: { duration: 0, easing: (t: any) => t, clamp: true }
  }), []);

  const speed = useMemo<SpeedFunction>(() => {
    if (typeof props.speed === "function") return props.speed;
    if (typeof props.speed === "number") return () => props.speed as number;
    return defaultSpeed;
  }, [ props.speed ]);
  
  const scroll = useCallback((isRevealing: boolean) => {
    const gap = ref.current!.scrollWidth - Math.max(ref.current!.clientWidth, ref.current!.offsetWidth);
    const final = isRevealing ? gap : 0;

    set({
      x: final,
      config: { duration: Math.abs(final - x.get()) / speed(isRevealing, gap, ref.current!) * 1000 }
    });
  }, [ set, speed ]);

  const onMouseOver = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    scroll(true);
    if (props.onMouseOver) props.onMouseOver(event);
  }, [ props.onMouseOver ]);

  const onMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    scroll(false);
    if (props.onMouseLeave) props.onMouseLeave(event);
  }, [ props.onMouseLeave ]);  

  return (
    <div
      {...props}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      ref={(div) => {
        (ref as any).current = div;
        
        if (typeof props.divRef === "function") props.divRef(div);
        else if (typeof props.divRef === "object" && props.divRef !== null) props.divRef.current = div;
      }}
    />
  )
};