import { getProxyByStrings } from "../../webpack";
import { dirtyDispatch } from "../../webpack/common";

export * from "./patch";
export { default as MenuComponents } from "./components";

export interface MenuRenderProps {
  className: "context-menu",
  config: MenuConfig & { context: "APP" },
  context: "APP",
  onHeightUpdate: () => void,
  position: "right" | "left",
  target: Element,
  theme: string
};
export interface MenuConfig {
  position?: "right" | "left", 
  align?: "top" | "bottom", 
  onClose?: Function
};

const openMenuModule = getProxyByStrings<typeof openMenu>([ "new DOMRect", ".enableSpellCheck" ], { searchExports: true });

export function closeMenu() {
  return dirtyDispatch({ type: "CONTEXT_MENU_CLOSE" });
};
export function openMenu(event: MouseEvent | React.MouseEvent, menu: (props: MenuRenderProps) => React.ReactNode, config: MenuConfig = {}) {
  openMenuModule(event, menu, config);

  return () => closeMenu();
};
