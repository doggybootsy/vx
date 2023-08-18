import { MenuRenderProps } from "renderer/menus";
import * as patcher from "renderer/patcher";
import webpack, { filters } from "renderer/webpack";

const openContextMenuLazyFilter = filters.byRegexes(/function .{1,3}\((.{1,3}),(.{1,3}),(.{1,3})\){.{1,3}\(\1,void 0,\3,\2\)\}/);

(async function() {
  await webpack.getLazy(openContextMenuLazyFilter, { searchExports: true });

  const openContextMenuLazy = await webpack.getLazyAndKey(openContextMenuLazyFilter);

  patcher.instead("VX/contextMenus", ...openContextMenuLazy, (that, [ event, resolvable, options ], original) => {
    return original.call(that, event, async () => {
      const render = await (resolvable as () => Promise<React.FunctionComponent>)();

      return (props: menuProps) => {
        const element = render(props) as React.ReactElement;

        if (element && element instanceof Object) handlePatch(props, element);
        
        return element;
      };
    }, options);
  });
})();

const openContextMenuFilter = filters.byStrings("new DOMRect", ".enableSpellCheck");
(async function() {
  const openContextMenu = await webpack.getLazyAndKey(openContextMenuFilter);

  patcher.instead("VX/contextMenus", ...openContextMenu, (that, [ event, render, options ], original) => {
    return original.call(that, event, function(this: any, props: menuProps) {
      const res = (render as React.FunctionComponent).call(this, props) as React.ReactElement;

      if (res && res instanceof Object) handlePatch(props, res);

      return res;
    }, options);
  });
})();

function handlePatch(props: menuProps, res: React.ReactElement) {
  const navId = getNavId(res);

  if (navId) sendPatch(props, res);
  else {
    const layer = res.props.children ? res.props.children : res;
    
    if (typeof layer.type === "function") patchMenuRecursive(layer);
  };
};

interface menuProps extends MenuRenderProps {
  [key: string | symbol | number]: any
};

const menuPatchers = new Map<string, Map<string, Set<(props: menuProps, res: React.ReactElement) => void>>>();

function getNavId(res: React.ReactElement) {  
  if (res.props.navId) return res.props.navId;
  return res.props.children?.props?.navId;
};

function sendPatch(props: menuProps, res: React.ReactElement) {
  for (const [, patchParent ] of menuPatchers){
    for (const [ menuId, patches ] of patchParent) {
      const navId = getNavId(res)!;

      if (menuId !== navId) continue;
      for (const patch of patches) patch(props, res);
    };
  }
};

const MAX_SEARCHES = 10;
const subPatches = new WeakMap();

const subPatch = function(this: any, type: React.JSXElementConstructor<menuProps>, props: menuProps) {
  const res = (type as (...args: any[]) => React.ReactElement).apply(this, Array.from(arguments).slice(1));
  
  if (res && res instanceof Object) handlePatch(props, res);
  
  return res;
};

function patchMenuRecursive(element: React.ReactElement, ref = { current: 0 }) {
  if (typeof element.type !== "function") return;
  const { type } = element;
  if (ref.current++ >= MAX_SEARCHES) return;

  let patch;

  if (subPatches.has(type)) patch = subPatches.get(type);
  else if (element.type.prototype?.isReactComponent) {
    class Component extends (element.type as React.ComponentClass<menuProps>) {
      render() {
        const res = super.render() as React.ReactElement;

        if (res && res instanceof Object) handlePatch(this.props, res);

        return res;
      }
    };

    subPatches.set(type, patch = Component);
  }
  else subPatches.set(type, patch = subPatch.bind(undefined, type));

  element.type = patch;
};

export function patch(id: string, menuId: string, callback: (props: menuProps, res: React.ReactElement) => void) {
  if (!menuPatchers.has(id)) menuPatchers.set(id, new Map());
  const patches = menuPatchers.get(id)!;
  if (!patches.has(menuId)) patches.set(menuId, new Set());
  const menuPatches = patches.get(menuId)!;
  menuPatches.add(callback);

  return () => void menuPatches.delete(callback);
};
export function unpatchAll(id: string) {
  menuPatchers.delete(id);
};

// This is to prevent console spam
Object.defineProperty(Document.prototype, "ownerDocument", { get() { return this; }, configurable: true });
