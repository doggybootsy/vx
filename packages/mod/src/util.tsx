import React, { createElement, lazy as $lazy, Suspense, Component } from "react";
import { getProxyByKeys } from "@webpack";
import { User } from "discord-types/general";
import { FluxStore } from "discord-types/stores";

export function proxyCache<T extends object>(factory: () => T, typeofIsObject: boolean = false): T {
  const handlers: ProxyHandler<T> = {};

  const cacheFactory = cache(factory);
  
  for (const key of Object.getOwnPropertyNames(Reflect) as Array<keyof typeof Reflect>) {
    const handler = Reflect[key];

    if (key === "get") {
      handlers.get = (target, prop, r) => {
        if (prop === "prototype") return (cacheFactory() as any).prototype ?? Function.prototype;
        if (prop === Symbol.for("vx.proxy.cache")) return cacheFactory;
        return Reflect.get(cacheFactory(), prop, r);
      };
      continue;
    }
    if (key === "ownKeys") {
      handlers.ownKeys = () => {
        const keys = Reflect.ownKeys(cacheFactory());
        if (!typeofIsObject && !keys.includes("prototype")) keys.push("prototype");
        return keys; 
      };
      continue;
    }

    // @ts-expect-error
    handlers[key] = function(target, ...args) {
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
  const cache = { } as { current: T } | { };

  return () => {
    if ("current" in cache) return cache.current;
    
    const current = factory();
    (cache as { current: T }).current = factory();

    return current;
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

export function findInTree<T extends Object>(tree: any, searchFilter: (item: any) => any, options: {
  walkable?: string[] | null,
  ignore?: string[],
  _hasSeen?: WeakSet<any>
} = {}): T | void {
  const { walkable = null, ignore = [], _hasSeen = new WeakSet() } = options;
  
  if (!(tree instanceof Object)) return undefined;
  
  if (_hasSeen.has(tree)) return;
  if (searchFilter(tree)) return tree as T;

  _hasSeen.add(tree);

  let tempReturn: any;
  if (tree instanceof Array) {
    for (const value of tree) {
      tempReturn = findInTree(value, searchFilter, { walkable, ignore, _hasSeen });
      if (typeof tempReturn != "undefined") return tempReturn;
    }
  }
  else {
    const toWalk = walkable == null ? Object.keys(tree) : walkable;
    for (const key of toWalk) {
      const value = tree[key];

      if (typeof(value) === "undefined" || ignore.includes(key)) continue;

      tempReturn = findInTree(value, searchFilter, { walkable, ignore, _hasSeen });
      if (typeof tempReturn !== "undefined") return tempReturn;
    }
  }

  return tempReturn;
};

export function findInReactTree<T extends Object>(tree: any, searchFilter: (item: any) => any): T | void {
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

export const base64 = {
  decode(base64: string) {
    return new TextDecoder().decode(Uint8Array.from(atob(base64), (m) => m.codePointAt(0)!));
  },
  encode(text: string) {
    return btoa(String.fromCodePoint(...new TextEncoder().encode(text)));
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
  text = text.replace(/[\.\[\]\(\)\\\$\^\|\?\*\+]/g, "\\$&");
  return new RegExp(text, flags);
};

export function getRandomItem<T extends any[]>(array: T): T[number] {
  return array.at(Math.floor(Math.random() * array.length))!;
};

// Not a secure hash
export function hashCode(str: string) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const defaultAvatarModule = getProxyByKeys<{
  DEFAULT_AVATARS: string[]
}>([ "DEFAULT_AVATARS" ]);
export function getDefaultAvatar(id?: string) {
  if (typeof id === "string") {
    let number = Number(id);
    if (isNaN(number)) number = hashCode(id);

    return defaultAvatarModule.DEFAULT_AVATARS[number % 5];
  };

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

export function iteratorFrom<T>(iterator: Iterable<T>): IterableIterator<T> {
  if (typeof (window as any).Iterator === "function") {
    return (window as any).Iterator.from(iterator);
  };

  const generator = iterator[Symbol.iterator]();
  
  const data = {};
  Object.defineProperty(data, "next", {
    enumerable: false,
    writable: true,
    configurable: true,
    value: generator.next.bind(generator)
  });
  Object.defineProperty(data, Symbol.toStringTag, {
    enumerable: false,
    writable: false,
    configurable: true,
    value: "Array Iterator"
  });

  const proto = {};
  Object.defineProperty(proto, Symbol.iterator, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: iterator[Symbol.iterator].bind(generator)
  });

  Object.setPrototypeOf(data, proto);

  return data as IterableIterator<T>;
};

export class VXNodeList<T extends Node> {
  constructor(nodes: Iterable<T> = []) {
    this.#array = Array.from(nodes).filter((node) => node instanceof Node);
  };

  #array: T[];

  query(selectors: string): T | null {
    for (const node of this) {
      if (!(node instanceof Element)) continue;
      if (node.matches(selectors)) return node;
    };

    return null;
  };
  includes(node: T | null): boolean {
    if (node === null) return false;
    return this.#array.includes(node);
  };

  get length() { return this.#array.length; };

  entries() {
    const gen = this.values();
    let result: IteratorResult<T, void>;
    let counter = 0;
    const entries: [ number, T ][] = [];

    while ((result = gen.next(), !result.done)) {
      entries.push([ counter++, result.value ]);
    };

    return iteratorFrom(entries);
  };

  keys() {
    const gen = this.values();
    let result: IteratorResult<T, void>;
    let counter = 0;
    const keys: [ number, T ][] = [];

    while ((result = gen.next(), !result.done)) {
      keys.push([ counter++, result.value ]);
    };

    return iteratorFrom(keys);
  };

  values(): IterableIterator<T> {
    return iteratorFrom(this.#array); 
  };

  item(index: number): T | null {
    return this.#array.at(index) ?? null;
  };

  forEach(callbackfn: (value: T, key: number, parent: VXNodeList<T>) => void, thisArg: any = this) {
    for (const [ key, node ] of this.entries()) {
      callbackfn.apply(thisArg, [ node, key, this ]);
    };
  };

  [Symbol.iterator]() {
    return iteratorFrom(this.#array); 
  };
};

export function getParents(element: Element | null): VXNodeList<Element> {
  if (!element) return new VXNodeList();

  const parents = [];

  while (element = element.parentElement) {
    parents.push(element);
  };
  
  return new VXNodeList(parents);
};

export function createAbort(): readonly [ (reason?: any) => void, () => AbortSignal ] {
  let controller = new AbortController();

  function abort(reason?: any) {
    controller.abort(reason);

    controller = new AbortController();
  };

  return [ abort, () => controller.signal ];
};

export function isInvalidSyntax(code: string): false | SyntaxError {
  try {
    new Function(code);
    return false;
  } 
  catch (error) {
    // IDK what other kind of errors i can get but better safe than sry
    if (error instanceof SyntaxError) return error;
    return false;
  }
};

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

type NotFunction<T> = Exclude<T, Function>
export function memorize<T extends { [key in string]: () => any }>(instance: T & NotFunction<T>): { [key in keyof T]: ReturnType<T[key]> } {
  const clone = {} as { [key in keyof T]: ReturnType<T[key]> };

  for (const key in instance) {
    if (Object.prototype.hasOwnProperty.call(instance, key)) {
      const element = instance[key as keyof T];
      
      Object.defineProperty(clone, key, {
        get: cache(element)
      });
    };
  };

  return clone;
};

export function getDiscordTag(user: User) {
  const isPomelo = (user as any).isPomelo() || (user.discriminator === "0000");
  return [
    // isPomelo ? "@" : false,
    (user as any).globalName || user.username,
    !isPomelo ? `#${user.discriminator}` : false
  ].filter((m) => m).join("");
};

export function generateFaviconURL(website: string): string {
  const url = new URL("https://www.google.com/s2/favicons");
  url.searchParams.set("sz", "64");
  url.searchParams.set("domain", website);
  return url.href;
};

export function createFluxComponent<T>(stores: FluxStore[] | FluxStore, factory: () => T) {
  const sym = Symbol("vx.flux.component");

  const $stores = Array.isArray(stores) ? stores : [ stores ];

  class FluxComponent<P = {}, S = {},  SS = {}> extends React.Component<P, S, SS> {
    constructor(props: P) {
      super(props);

      this.forceUpdateFluxState = this.forceUpdateFluxState.bind(this);
      
      const { componentWillUnmount, componentDidMount } = this;

      this.componentDidMount = function() {
        componentDidMount.call(this);

        if (!this[sym].componentDidMount) {
          console.warn("[VX~FluxComponent]: Original 'componentDidMount' wasn't ran! Make sure to do 'super.componentDidMount()'!");
          FluxComponent.prototype.componentDidMount.call(this);
        }
      };
      this.componentWillUnmount = function() {
        componentWillUnmount.call(this);

        if (!this[sym].componentWillUnmount) {
          console.warn("[VX~FluxComponent]: Original 'componentWillUnmount' wasn't ran! Make sure to do 'super.componentWillUnmount()'!");
          FluxComponent.prototype.componentWillUnmount.call(this);
        }
      };
    };

    public readonly fluxState: T = factory();
    private readonly [sym] = {
      componentDidMount: false,
      componentWillUnmount: false
    };
    
    protected forceUpdateFluxState(callback?: () => void) {
      (this as any).fluxState = factory();
      this.forceUpdate(callback);
    };

    public componentDidMount(): void {
      for (const store of $stores) {
        store.addChangeListener(this.forceUpdateFluxState);
      }
      this[sym].componentDidMount = true;
    };
    public componentWillUnmount(): void {
      for (const store of $stores) {
        store.removeChangeListener(this.forceUpdateFluxState);
      }
      this[sym].componentWillUnmount = true;
    };
  };

  return FluxComponent;
};