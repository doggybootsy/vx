import { Parameters } from "typings";
import { proxyCache } from "../util";
import { getLazyByKeys } from "./filters";

type ReactType = typeof import("react");

export const Suspense = Symbol.for("react.suspense") as unknown as ReactType["Suspense"];
export const Fragment = Symbol.for("react.fragment") as unknown as ReactType["Fragment"];

export const useState = proxyCache(() => React.useState);
export const useReducer = proxyCache(() => React.useReducer);
export const useMemo = proxyCache(() => React.useMemo);
export const useEffect = proxyCache(() => React.useEffect);
export const useRef = proxyCache(() => React.useRef);
export const useDeferredValue = proxyCache(() => React.useDeferredValue);
export const useCallback = proxyCache(() => React.useCallback);
export const useLayoutEffect = proxyCache(() => React.useLayoutEffect);
export const useInsertionEffect = proxyCache(() => React.useInsertionEffect);

export const Children = proxyCache(() => React.Children);

export const createElement = proxyCache(() => React.createElement);
export const cloneElement = proxyCache(() => React.cloneElement);
export function isValidElement(component: any): component is React.ReactElement {
  if (typeof component !== "object") return false;
  if (component === null) return false;
  return component.$$typeof === Symbol.for("react.element");
};

export function lazy<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>): React.LazyExoticComponent<T> {
  return proxyCache(() => React.lazy(factory), true);
};

export function memo<T extends React.ComponentType<any>>(type: T, compare?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean): React.MemoExoticComponent<T> {
  return proxyCache(() => React.memo(type, compare), true);
};

export function forwardRef<T, P = {}>(type: React.ForwardRefRenderFunction<T, P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>> {
  return proxyCache(() => React.forwardRef(type), true);
};

export function startTransition(scope: React.TransitionFunction) {
  return React.startTransition(scope);
};

export function useSyncExternalStore(subscribe: (onStoreChange: () => void) => () => void, getSnapshot: () => unknown, getServerSnapshot?: (() => unknown) | undefined) {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

class BaseComponent {
  constructor(...args: Parameters<ReactType["Component"]>) {
    const component = Reflect.construct(React.Component, args);
    // Can't do it to 'this' directly
    Object.setPrototypeOf(Object.getPrototypeOf(this), component);
  };

  static {
    (this.prototype as any).isReactComponent = {};
  };
};

export const Component = BaseComponent as unknown as ReactType["Component"];

let React = {
  useState,
  useMemo,
  useEffect,
  useRef,
  useDeferredValue,
  useCallback,
  useLayoutEffect,
  useInsertionEffect,
  Component,
  Children,
  createElement,
  cloneElement,
  lazy,
  memo,
  isValidElement,
  forwardRef,
  Suspense,
  Fragment,
  startTransition
} as ReactType;

getLazyByKeys<ReactType>([ "createElement", "memo" ]).then((react) => {
  React = react;
});

export default new Proxy(React, {
  get(target, prop, receiver) {
    if (prop === Symbol.for("vx.react")) return React;
    return React[prop as keyof ReactType];
  },
  ownKeys() {
    return Array.from(new Set([ ...Reflect.ownKeys(React), "prototype" ]));
  }
});