import React, { createElement, lazy as $lazy, Suspense, Component } from "react";
import { getProxyByKeys } from "./webpack";

export function proxyCache<T extends object>(factory: () => T, typeofIsObject: boolean = false): T {
  const handlers: ProxyHandler<T> = {};

  const cacheFactory = cache(factory);
  
  for (const key of Object.getOwnPropertyNames(Reflect)) {
    const $key = key as keyof typeof Reflect;
    const handler = Reflect[$key];

    if (key === "get") {
      handlers.get = (target, prop, r) => {
        if (prop === Symbol.for("vx.proxy.cache")) return cacheFactory;
        return Reflect.get(cacheFactory(), prop, r);
      };
      continue;
    }

    // @ts-expect-error
    handlers[$key] = function(target, ...args) {
      // @ts-expect-error
      return handler.call(this, cacheFactory(), ...args);
    };
  }

  const proxy = new Proxy(Object.assign(typeofIsObject ? {} : function() {}, {
    [Symbol.for("vx.proxy.cache")]: cacheFactory
  }) as T, handlers);

  return proxy;
};
export function cache<T>(factory: () => T): () => T {
  const cache = { ref: null, hasValue: false } as { ref: null | T, hasValue: boolean };

  return () => {
    if (cache.hasValue) return cache.ref!;
    
    cache.ref = factory();
    cache.hasValue = true;

    return cache.ref;
  }
};

export function cacheComponent<P extends {}>(factory: () => React.FunctionComponent<P>) {
  const cacheFactory = cache(factory);

  return (props: P) => createElement(cacheFactory(), props);
};
export function lazy<T extends React.ComponentType<any>>(factory: () => Promise<T | { default: T }>): React.LazyExoticComponent<T> {
  return $lazy(async () => {
    const result = await factory();

    if (result instanceof Object && "default" in result) return result;
    return { default: result };
  });
};

export function makeLazy<T extends React.ComponentType<any>>(opts: {
  factory: () => Promise<T>,
  fallback?: React.ComponentType<{}>,
  name?: string
}): React.ComponentClass<React.ComponentPropsWithRef<T>> {
  const { factory } = opts;

  const Lazy = lazy(factory);
  const Fallback = opts.fallback ?? (() => null);

  class LazyComponent extends Component<React.ComponentPropsWithRef<T>> {
    static displayName: string = `VX(Suspense(${"name" in opts ? opts.name : "Unknown"}))`;

    render() {
      return (
        <Suspense fallback={<Fallback />}>
          {createElement(Lazy, this.props as React.ComponentPropsWithRef<T>)}
        </Suspense>
      );
    };
  };

  return LazyComponent;
};

interface classNameValueTypes {
  array: Array<string | void | false | classNameValueTypes["object"]>
  object: Record<string, boolean>
};

export function className(classNames: classNameValueTypes["array"] | classNameValueTypes["object"]) {
  if (!Array.isArray(classNames)) classNames = [ classNames ];
  
  function parseString(className: string) {
    return className.split(" ").filter(Boolean).join(" ");
  };

  const flattenedString: string[] = [];
  for (const className of classNames) {
    if (!className) continue;

    if (typeof className === "string") {
      flattenedString.push(parseString(className));
      continue;
    };

    for (const key in className) {
      if (Object.prototype.hasOwnProperty.call(className, key)) {
        if (className[key]) flattenedString.push(parseString(key));
      };
    };
  };

  return Array.from(new Set(flattenedString)).join(" ");
};

export function findInTree<T>(tree: any, searchFilter: (item: any) => any, options: {
  walkable?: string[] | null,
  ignore?: string[]
} = {}): T | void {
  const { walkable = null, ignore = [] } = options;

  if (searchFilter(tree)) return tree as T;

  if (typeof tree !== "object" || tree == null) return undefined;

  let tempReturn: any;
  if (tree instanceof Array) {
    for (const value of tree) {
      tempReturn = findInTree(value, searchFilter, { walkable, ignore });
      if (typeof tempReturn != "undefined") return tempReturn;
    }
  }
  else {
    const toWalk = walkable == null ? Object.keys(tree) : walkable;
    for (const key of toWalk) {
      const value = tree[key];

      if (typeof(value) === "undefined" || ignore.includes(key)) continue;

      tempReturn = findInTree(value, searchFilter, { walkable, ignore });
      if (typeof tempReturn !== "undefined") return tempReturn;
    }
  }
  return tempReturn;
};

export function findInReactTree<T>(tree: any, searchFilter: (item: any) => any): T | void {
  return findInTree(tree, searchFilter, { walkable: [ "children", "props" ] });
};

export class InternalStore {
  static stores = new Set();
  constructor() {
    InternalStore.stores.add(this);
  };

  displayName?: string;

  #listeners = new Set<() => void>();
  
  addChangeListener(callback: () => void) {
    this.#listeners.add(callback);
  };
  removeChangeListener(callback: () => void) {
    this.#listeners.delete(callback);
  };

  emit() {
    for (const listener of this.#listeners) {
      listener();
    };
  };
};

const copyCommandSupported = document.queryCommandEnabled("copy") || document.queryCommandSupported("copy");
export const clipboard = {
  SUPPORTS_COPY: typeof window.VXNative === "object" || typeof navigator.clipboard === "object" || copyCommandSupported,
  async copy(text: string) {
    if (window.VXNative) {
      window.VXNative.clipboard.copy(text);
      return true;
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Do nothing
      }
    }
    if (copyCommandSupported && document.body) {
      const range = document.createRange();
      const selection = window.getSelection();
      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.contentEditable = "true";
      textarea.style.visibility = "none";

      document.body.appendChild(textarea);

      range.selectNodeContents(textarea);

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      };

      textarea.focus();
      textarea.setSelectionRange(0, text.length);

      document.execCommand("copy");

      document.body.removeChild(textarea);

      return true;
    };

    throw new Error("Clipboard action isn't supported!");
  }
};

export function getComponentType<P>(component: string | React.ComponentType<P> | React.MemoExoticComponent<React.ComponentType<P>> | React.ForwardRefExoticComponent<P>): React.ComponentType<P> | string {
  if (component instanceof Object && "$$typeof" in component) {
    if (component.$$typeof === Symbol.for("react.memo")) return getComponentType<P>((component as any).type);
    if (component.$$typeof === Symbol.for("react.forward_ref")) return getComponentType<P>((component as any).render);
  };

  return component as React.ComponentType<P> | string;
};

export function escapeRegex(text: string, flags?: string): RegExp {
  text = text.replace(/[\.\[\]\(\)\\\$\^\|\?\*]/g, "\\$&");
  return new RegExp(text, flags);
};

export function getRandomItem<T extends any[]>(array: T): T[number] {
  return array.at(Math.floor(Math.random() * array.length))!;
};

const defaultAvatarModule = getProxyByKeys<{
  DEFAULT_AVATARS: string[]
}>([ "DEFAULT_AVATARS" ]);
export function getRandomDefaultAvatar() {
  return getRandomItem(defaultAvatarModule.DEFAULT_AVATARS);
};

const patchedReactHooks = {
  useMemo(factory: () => any) {
    return factory();
  },
  useState(initial: any) {
    if (typeof initial === "function") return [ initial(), () => {} ];
    return [ initial, () => {} ];
  },
  useReducer(initial: any) {
    if (typeof initial === "function") return [ initial(), () => {} ];
    return [ initial, () => {} ];
  },
  useEffect() {},
  useLayoutEffect() {},
  useRef(value: any = null) {
    return { current: value };
  },
  useCallback(callback: Function) {
    return callback;
  },
  useContext(context: any) {
    return context._currentValue;
  }
};
export function wrapInHooks<P>(functionComponent: React.FunctionComponent<P>): React.FunctionComponent<P> {  
  return (props?: P, context?: any) => {
    const reactDispatcher = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;

    const clone = { ...reactDispatcher };

    Object.assign(reactDispatcher, patchedReactHooks);

    try {
      const result = functionComponent(props ?? {} as P, context);

      Object.assign(reactDispatcher, clone);

      return result;
    } 
    catch (error) {
      Object.assign(reactDispatcher, clone);

      throw error;
    }
  };
};

export function showFilePicker(callback: (file: File | null) => void, accepts: string = "*") {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accepts;

  input.showPicker();

  input.addEventListener("change", () => {
    input.remove();

    const [ file ] = input.files!;
    
    callback(file ?? null);
  });
};

export function download(filename: string, part: BlobPart) {
  const blob = new Blob([ part ], { type: "application/octet-binary" });
  const blobURL = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = blobURL;
  anchor.download = filename;
  document.body.append(anchor);

  anchor.click();

  anchor.remove();
  URL.revokeObjectURL(blobURL);
};

export function getParents(element: Element | null) {
  const parents: Element[] = [];

  while (element && (element = element.parentElement)) {
    parents.push(element);
  }
  
  return parents;
};