import { getProxyByKeys } from "@webpack";
import { className } from "../util";
import ErrorBoundary from "./boundary";
import { forwardRef, Component, useMemo } from "react";

type OverflowValue = "scroll" | "hidden";

const scrollerClasses = getProxyByKeys<Webpack.ClassModule>([ "thin", "customTheme" ]);

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
interface ScrollerProps extends DivProps {
  type: "thin" | "auto" | "none",
  fade?: boolean,
  overflow: OverflowValue | `${OverflowValue} ${OverflowValue}`
}

export const Scroller = forwardRef<HTMLDivElement, ScrollerProps>(({ type, fade, children, style, overflow, ...props }, ref) => {
  const cn = useMemo(() => (
    className([
      props.className,
      scrollerClasses[type],
      fade && scrollerClasses.fade
    ])
  ), [ props.className, type, fade ]);

  return (
    <div
      {...props}
      className={cn}
      ref={ref}
      style={{
        ...style,
        overflow
      }}
      data-scroller-type={type}
    >
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  )
});