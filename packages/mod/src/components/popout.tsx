import { getProxyByKeys } from "../webpack";
import ErrorBoundary from "./boundary";

const PopoutModule = getProxyByKeys<{
  Popout: any
}>([ "Button", "Tooltip" ]);

interface Animation {
  NONE: string,
  TRANSLATE: string,
  SCALE: string,
  FADE: string
};

export type PopoutPosition = "top" | "bottom" | "left" | "right" | "center";
export type PopoutAlign = "top" | "bottom" | "left" | "right" | "center";

interface RenderPopoutProps {
  closePopout(): boolean,
  isPositioned: boolean,
  nudge: number,
  position: null | PopoutPosition,
  setPopoutRef(value: Element | null): void,
  updatePosition(): void
};
interface ChildrenPopoutProps {
  "aria-controls": string,
  "aria-expanded": boolean,
  onClick(event: React.MouseEvent): void,
  onKeyDown(event: React.KeyboardEvent): void,
  onMouseDown(): void
};

interface PopoutProps {
  animation?: string,
  autoInvert?: boolean,
  nudgeAlignIntoViewport?: boolean,
  position?: PopoutPosition,
  align?: PopoutAlign,
  spacing?: number,
  shouldShow: boolean,
  onRequestClose?(): void,
  renderPopout(props: RenderPopoutProps): React.ReactElement,
  children(props: ChildrenPopoutProps, state: { isShown: boolean }): React.ReactElement
};

function PopoutComponent(props: PopoutProps): React.ReactElement {
  return (
    <ErrorBoundary>
      <PopoutModule.Popout {...props} />
    </ErrorBoundary>
  )
};

Object.defineProperty(PopoutComponent, "Animation", {
  get: () => PopoutModule.Popout.Animation
});

export const Popout = PopoutComponent as React.FunctionComponent<PopoutProps> & { Animation: Animation };