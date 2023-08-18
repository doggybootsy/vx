import VXError from "renderer/error";
import webpack, { filters } from "renderer/webpack";

export * from "./patch";

export interface MenuConfig {
  position?: "right" | "left", 
  align?: "top" | "bottom", 
  onClose?: Function
};

let openContextMenu: typeof openMenu | undefined;

export interface MenuRenderProps {
  className: "context-menu",
  config: MenuConfig & { context: "APP" },
  context: "APP",
  onHeightUpdate: () => void,
  position: "right" | "left",
  target: Element,
  theme: string
};

export function openMenu(event: MouseEvent | React.MouseEvent, menu: (props: MenuRenderProps) => React.ReactNode, config: MenuConfig = {}) {
  if (!webpack.isReady) return () => {};

  if (!openContextMenu) {
    const search = webpack.getModule<typeof openMenu>(filters.byStrings("new DOMRect", ".enableSpellCheck"), { searchExports: true });

    if (search) openContextMenu = search;
    else throw new VXError(VXError.codes.MODULE_NOT_FOUND);
  };

  openContextMenu(event, menu, config);

  return () => closeMenu();
};
export function closeMenu() {
  const dispatcher = webpack.common.dispatcher;
  if (!dispatcher) return;

  dispatcher.dispatch({
    type: "CONTEXT_MENU_CLOSE"
  });
};

export { default as components } from "./components";