import { Component } from "react";
import { MenuRenderProps } from ".";
import { addPlainTextPatch } from "@webpack";

type MenuCallback = (props: MenuProps, res: React.ReactElement) => void;
const menuPatches = new Map<string, Map<string, Set<MenuCallback>>>();
export function patch(caller: string, menuId: string, callback: MenuCallback) {
  if (!menuPatches.has(caller)) menuPatches.set(caller, new Map());

  const callerPatches = menuPatches.get(caller)!;
  if (!callerPatches.has(menuId)) callerPatches.set(menuId, new Set);

  const menusPatches = callerPatches.get(menuId)!;
  menusPatches.add(callback);

  return () => void menusPatches.delete(callback);
}
export function unpatch(caller: string, menuId?: string) {
  if (!menuPatches.has(caller)) return;

  const callerPatches = menuPatches.get(caller)!;
  if (typeof menuId !== "string") {
    callerPatches.clear();
    return;
  }

  const menusPatches = callerPatches.get(menuId)!;
  menusPatches.clear();
}

addPlainTextPatch({
  identifier: "VX(menus)",
  match: 'dispatch({type:"CONTEXT_MENU_CLOSE"})',
  find: /render:(.{1,3}),renderLazy:(.{1,3}),/,
  replace: "render:window.VX.menus._handleMenu($1,false),renderLazy:VX.menus._handleMenu($2,true),"
});

export interface MenuProps extends MenuRenderProps {
  [key: PropertyKey]: any
}

function sendPatch(navId: string, props: MenuProps, res: React.ReactElement) {  
  for (const [, patchParent ] of menuPatches){
    for (const [ menuId, patches ] of patchParent) {
      if (menuId !== navId) continue;
      for (const patch of patches) patch(props, res);
    };
  }
}

function getNavId(res: React.ReactElement) {  
  if (res.props.navId) return res.props.navId;
  return res.props.children?.props?.navId;
}
const MAX_SEARCHES = 50;
const subPatches = new WeakMap();

function subPatch(this: any, type: React.JSXElementConstructor<MenuProps>, props: MenuProps) {  
  const res = (type as (...args: any[]) => React.ReactElement).apply(this, Array.from(arguments).slice(1));
  
  if (res && res instanceof Object) handlePatch(props, res);

  return res;
}

function patchMenuRecursive(element: React.ReactElement) {
  if (typeof element.type !== "function") return;
  const { type } = element;

  let patch;

  if (subPatches.has(type)) patch = subPatches.get(type);
  else if (element.type.prototype?.isReactComponent) {
    class Component extends (element.type as React.ComponentClass<MenuProps>) {
      render() {
        const res = super.render() as React.ReactElement;

        if (res && res instanceof Object) handlePatch(this.props, res);

        return res;
      }
    }

    subPatches.set(type, patch = Component);
  }
  else subPatches.set(type, patch = subPatch.bind(undefined, type));

  element.type = patch;
}

function handlePatch(props: MenuProps, res: React.ReactElement) {
  const navId = getNavId(res);

  if (navId) sendPatch(navId, props, res);
  else {
    const layer = res.props.children ? res.props.children : res;
    
    if (typeof layer.type === "function") patchMenuRecursive(layer);
  }
}

function replaceMenu(menu: (props: any) => React.ReactElement) {
  return (props: any) => {
    const res = menu(props);    

    if (res) handlePatch(props, res);

    return res;
  }
}

export function _handleMenu(render: any, lazy: boolean) {  
  if (!render) return;
  if (lazy) return () => render().then(replaceMenu);
  return replaceMenu(render);
}

// This is to prevent console spam
Object.defineProperty(Document.prototype, "ownerDocument", { 
  get() { return this instanceof Document ? this : document; }, 
  configurable: true 
});