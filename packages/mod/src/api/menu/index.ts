import { byStrings, getMangledProxy, getProxyByKeys } from "@webpack";
import { dirtyDispatch } from "@webpack/common";

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
}
export interface MenuConfig {
  position?: "right" | "left", 
  align?: "top" | "bottom", 
  onClose?: Function
}

type Callback = () => void;

const contextMenuManager = getMangledProxy<{
  openContextMenu(...args: Parameters<typeof openMenu>): void,
  closeContextMenu(callback?: Callback): void,
  openContextMenuLazy(event: MouseEvent | React.MouseEvent, menu: () => Promise<(props: MenuRenderProps) => React.ReactNode>, config?: MenuConfig): void
}>('type:"CONTEXT_MENU_CLOSE"', {
  openContextMenu: byStrings("new DOMRect"),
  closeContextMenu: byStrings("CONTEXT_MENU_CLOSE"),
  openContextMenuLazy: m => typeof m === "function" && m.length === 3
});

export function closeMenu(callback?: Callback) {
  return dirtyDispatch({ type: "CONTEXT_MENU_CLOSE" }).finally(callback);
}
export function openMenu(event: MouseEvent | React.MouseEvent, menu: (props: MenuRenderProps) => React.ReactNode, config: MenuConfig = {}) {
  contextMenuManager.openContextMenu(event, menu, config);

  return () => closeMenu();
}
