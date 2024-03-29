import { Parameters } from "typings";
import { hasInstance, proxyCache, reactExists } from "../util";
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
export const useContext = proxyCache(() => React.useContext);

export function createContext<T>(value: T): React.Context<T> {
  const context = {
    $$typeof: Symbol.for("react.context"),
    _currentValue: value,
    _currentValue2: value,
    _threadCount: 0,
    Provider: null,
    Consumer: null,
    _defaultValue: null,
    _globalName: null
  };

  (context as any).Provider = {
    $$typeof: Symbol.for("react.provider"),
    _context: context
  };
  (context as any).Consumer = context;
  
  return context as unknown as React.Context<T>;
};

export const Children = proxyCache(() => React.Children);

export const createElement = proxyCache(() => React.createElement);
export const cloneElement = proxyCache(() => React.cloneElement);
export function isValidElement(component: any): component is React.ReactElement {
  if (typeof component !== "object") return false;
  if (component === null) return false;
  return component.$$typeof === Symbol.for("react.element");
}

export function lazy<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>): React.LazyExoticComponent<T> {
  return proxyCache(() => React.lazy(factory), true);
}

export function memo<T extends React.ComponentType<any>>(type: T, compare?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean): React.MemoExoticComponent<T> {
  return proxyCache(() => React.memo(type, compare), true);
}

export function forwardRef<T, P = {}>(render: React.ForwardRefRenderFunction<T, P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>> {
  // Breaks the whole mod wtf??
  return proxyCache(() => React.forwardRef(render), true);
  return {
    $$typeof: Symbol.for("react.forward_ref"),
    render
  } as any
}

export function startTransition(scope: React.TransitionFunction) {
  return React.startTransition(scope);
}

export function useSyncExternalStore(subscribe: (onStoreChange: () => void) => () => void, getSnapshot: () => unknown, getServerSnapshot?: (() => unknown) | undefined) {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

class BaseComponent {
  constructor(...args: Parameters<ReactType["Component"]>) {
    const component = Reflect.construct(React.Component, args);
    // Can't do it to 'this' directly
    Object.setPrototypeOf(Object.getPrototypeOf(this), component);
  }

  static [Symbol.hasInstance](instance: any): boolean {
    // Call once
    if (!reactExists) return hasInstance(BaseComponent, instance);

    return hasInstance(React.Component, instance) || hasInstance(BaseComponent, instance);
  }
  
  static {
    (this.prototype as any).isReactComponent = {};
  }
}

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
    return (target as any)[prop] = React[prop as keyof ReactType];
  },
  ownKeys() {
    return Array.from(new Set([ ...Reflect.ownKeys(React), "prototype" ]));
  }
});