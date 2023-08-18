import { ErrorBoundary } from "renderer/components";
import { cache } from "renderer/util";
import webpack from "renderer/webpack";

const TooltipModule = cache(() => webpack.common.components!.Tooltip);

interface TooltipColors {
  PRIMARY: string,
  BLACK: string,
  GREY: string,
  BRAND: string,
  GREEN: string,
  YELLOW: string,
  RED: string,
  CUSTOM: string,
  PREMIUM: string
};

interface PassedChildrenProps {
  ["aria-label"]: string,
  onBlur(): void,
  onClick(): void,
  onContextMenu(): void,
  onFocus(): void,
  onMouseEnter(): void,
  onMouseLeave(): void
};

interface TooltipProps {
  allowOverflow?: boolean,
  color?: string,
  forceOpen?: boolean,
  hide?: boolean,
  hideOnClick?: boolean,
  /** @note maybe? */
  position?: "top" | "bottom" | "left" | "right" | "center",
  /** @note maybe? */
  align?: "top" | "bottom" | "left" | "right" | "center",
  shouldShow?: boolean
  spacing?: number,
  text: string,
  children: (props: PassedChildrenProps) => React.ReactNode
};

function Tooltip(props: TooltipProps) {
  const React = webpack.common.React!;

  return (
    <ErrorBoundary>
      <TooltipModule.getter {...props} />
    </ErrorBoundary>
  );
};

Object.defineProperty(Tooltip, "Colors", {
  get: () => TooltipModule.getter.Colors
});

interface TooltipWrapperProps extends Omit<TooltipProps, "children"> {
  children: React.ReactNode
}
function TooltipWrapper(props: TooltipWrapperProps) {
  const React = webpack.common.React!;

  return (
    <Tooltip {...props}>
      {(tooltipProps) => (
        <div {...tooltipProps} className="vx-wrapped-tooltip">
          {props.children}
        </div>
      )}
    </Tooltip>
  );
}

Object.defineProperty(Tooltip, "Wrapper", {
  value: TooltipWrapper
});

export default Tooltip as typeof Tooltip & {
  Colors: TooltipColors, 
  Wrapper: typeof TooltipWrapper
};