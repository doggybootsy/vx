import { proxyCache } from "../util";
import { getProxyByProtoKeys } from "../webpack";
import ErrorBoundary from "./boundary";

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

const RawTooltip = getProxyByProtoKeys<React.FunctionComponent<TooltipProps> & { Colors: TooltipColors }>([ "renderTooltip", "shouldShowTooltip" ], { searchExports: true });

export function Tooltip(props: TooltipProps) {
  return (
    <ErrorBoundary>
      <RawTooltip {...props} />
    </ErrorBoundary>
  );
};
