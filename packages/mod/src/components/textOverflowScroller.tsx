import { forwardRef, useCallback, useMemo, useRef } from "react";
import { ReactSpring } from "@webpack/common";

interface TextOverflowScrollerProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  /**
   * @note Pixels per-second
   */
  speed?: number | ((isRevealing: boolean) => number)
}

// Have it go twice as fast on the way back
const defaultSpeed = (isRevealing: boolean) => isRevealing ? 75 : 150;

export const TextOverflowScroller = forwardRef(function TextOverflowScroller(props: TextOverflowScrollerProps, reference: React.ForwardedRef<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  const [ { x }, set ] = ReactSpring.useSpring(() => ({
    immediate: false,
    x: 0,
    onChange(distance: number) {
      if (ref.current) ref.current.scroll(distance, 0);
    },
    config: { duration: 0, easing: (t: any) => t, clamp: true }
  }), []);

  const speed = useMemo(() => {
    if (typeof props.speed === "function") return props.speed;
    if (typeof props.speed === "number") {
      const speed = props.speed;
      return () => speed;
    }

    return defaultSpeed;
  }, [ props.speed ]);
  
  const scroll = useCallback((isRevealing: boolean) => {
    const gap = ref.current!.scrollWidth - Math.max(ref.current!.clientWidth, ref.current!.offsetWidth);
    const final = isRevealing ? gap : 0;

    set({
      x: final,
      config: { duration: Math.abs(final - x.get()) / speed(isRevealing) * 1000 }
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
        
        if (typeof reference === "function") reference(div);
        else if (typeof reference === "object" && reference !== null) reference.current = div;
      }}
    />
  )
});