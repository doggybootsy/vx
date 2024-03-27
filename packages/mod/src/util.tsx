import React, { createElement, lazy as $lazy, Suspense, Component, useSyncExternalStore } from "react";
import { getLazyByKeys, getProxyByKeys } from "@webpack";
import { User } from "discord-types/general";
import { FluxStore } from "discord-types/stores";
import { logger } from "vx:logger";
import { debounce } from "common/util";
import { Fiber } from "react-reconciler";

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
      return handler.apply(this, [ cacheFactory() ].concat(args));
    };
  }

  const proxy = new Proxy(Object.assign(typeofIsObject ? {} : function() {}, {
    [Symbol.for("vx.proxy.cache")]: cacheFactory
  }) as T, handlers);

  return proxy;
}

export function cache<T>(factory: () => T): () => T {
  const cache = { } as { current: T } | { };

  return () => {
    if ("current" in cache) return cache.current;
    
    const current = factory();
    (cache as { current: T }).current = factory();

    return current;
  }
}

export function cacheComponent<P extends {}>(factory: () => React.FunctionComponent<P>): React.FunctionComponent<P> {
  const cacheFactory = cache(factory);

  return (props: P) => createElement(cacheFactory(), props);
}

export function lazy<T extends React.ComponentType<any>>(factory: () => Promise<T | { default: T }>): React.LazyExoticComponent<T> {
  return $lazy(async () => {
    const result = await factory();

    if (result instanceof Object && "default" in result) return result;
    return { default: result };
  });
}

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
      )
    }
  }

  return LazyComponent;
}

interface classNameValueTypes {
  array: Array<string | void | false | classNameValueTypes["object"]>
  object: Record<string, boolean>
};

export function className(classNames: classNameValueTypes["array"] | classNameValueTypes["object"]) {
  if (!Array.isArray(classNames)) classNames = [ classNames ];
  
  function parseString(className: string) {
    return className.split(" ").filter(Boolean).join(" ");
  }

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
      }
    }
  }

  return Array.from(new Set(flattenedString)).join(" ");
};

type ClassNameType = classNameValueTypes["array"] | classNameValueTypes["object"] | string | void | false | ClassName;

export class ClassName {
  constructor(...classNames: ClassNameType[]) {
    const classes: string[] = [];

    for (const cn of classNames) {
      if (!cn) continue;
      if (cn instanceof ClassName) {
        classes.push(...cn.keys());
        continue;
      }
      classes.push(...className(Array.isArray(cn) ? cn : [ cn ]).split(" "));
    }

    this.#classes = className(classes).split(" ");

    if (this.#classes.length === 1 && this.#classes[0] === "") this.#classes = [];
  }

  #classes: string[];

  add(...classNames: ClassNameType[]) {
    const cn = new ClassName(...classNames).keys();

    this.#classes = className([ ...this.#classes, ...cn ]).split(" ");
  }
  remove(...classNames: ClassNameType[]) {
    const cn = new ClassName(...classNames).keys();

    this.#classes = this.#classes.filter((className) => !cn.includes(className));
  }
  has(className: string) {
    return this.#classes.includes(className);
  }
  
  clear() {
    this.#classes = [];
  }

  keys() {
    return this.#classes.splice(0);
  }

  toString() {
    return this.#classes.join(" ");
  }

  toJSON() {
    return this.keys();
  }
  [Symbol.iterator]() {
    return iteratorFrom(this.#classes);
  }
}

let hasSeen: WeakSet<any> | null = null;
export function findInTree<T extends Object>(tree: any, searchFilter: (item: any) => any, options: {
  walkable?: string[] | null,
  ignore?: string[]
} = {}): T | void {
  hasSeen ??= new WeakSet();

  const { walkable = null, ignore = [] } = options;
  
  if (!(tree instanceof Object)) return;
  
  if (hasSeen.has(tree)) return;
  if (searchFilter(tree)) return tree as T;

  hasSeen.add(tree);

  let tempReturn: any;
  if (tree instanceof Array) {
    for (const value of tree) {
      tempReturn = findInTree(value, searchFilter, { walkable, ignore });
      if (typeof tempReturn != "undefined") {
        hasSeen = null;
        return tempReturn;
      }
    }
  }
  else {
    const toWalk = walkable == null ? Object.keys(tree) : walkable;
    for (const key of toWalk) {
      const value = tree[key];

      if (typeof(value) === "undefined" || ignore.includes(key)) continue;

      tempReturn = findInTree(value, searchFilter, { walkable, ignore });
      if (typeof tempReturn !== "undefined") {
        hasSeen = null;
        return tempReturn;
      }
    }
  }

  hasSeen = null;
  return tempReturn;
}

export function findInReactTree<T extends Object>(tree: any, searchFilter: (item: any) => any): T | void {
  return findInTree(tree, searchFilter, { walkable: [ "children", "props" ] });
}

export class InternalStore {
  public static stores = new Set<InternalStore>();
  public static getStore(name: string) {
    for (const store of InternalStore.stores) {
      if (InternalStore.prototype.getName.call(store) === name) return store;
    }
  }

  constructor() {
    InternalStore.stores.add(this);
  }

  public static displayName?: string;
  public displayName?: string;

  public getName() {
    if (this.displayName) return this.displayName;

    const constructor = this.constructor as typeof InternalStore;
    if (constructor.displayName) return constructor.displayName;

    return constructor.name;
  }

  #listeners = new Set<() => void>();
  
  public addChangeListener(callback: () => void) {
    this.#listeners.add(callback);
  }
  public removeChangeListener(callback: () => void) {
    this.#listeners.delete(callback);
  }

  public emit() {
    for (const listener of this.#listeners) {
      listener();
    }
  }
}

const copyCommandSupported = document.queryCommandEnabled("copy") || document.queryCommandSupported("copy");
export const clipboard = {
  SUPPORTS_COPY: typeof window.VXNative === "object" || typeof navigator.clipboard === "object" || copyCommandSupported,
  async readText() {
    if (window.VXNative) {
      return Promise.resolve(window.VXNative.clipboard.read());
    }
    if (navigator.clipboard) {
      try {
        return navigator.clipboard.readText();
      } catch (error) {
        // Do nothing
      }
    }
    
    throw new Error("Clipboard action isn't supported!");
  },
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
      }

      textarea.focus();
      textarea.setSelectionRange(0, text.length);

      document.execCommand("copy");

      document.body.removeChild(textarea);

      return true;
    }

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
  }

  return component as React.ComponentType<P> | string;
}

export function escapeRegex(text: string, flags?: string): RegExp {
  text = text.replace(/[\.\[\]\(\)\\\$\^\|\?\*\+]/g, "\\$&");
  return new RegExp(text, flags);
}

export function getRandomItem<T extends any[]>(array: T): T[number] {
  return array.at(Math.floor(Math.random() * array.length))!;
}

// Not a secure hash
export function hashCode(str: string) {
  let hash = 0;

  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
}

const defaultAvatarModule = getProxyByKeys<{
  DEFAULT_AVATARS: string[]
}>([ "DEFAULT_AVATARS" ]);

export function getDefaultAvatar(id?: string) {
  if (typeof id === "string") {
    let number = Number(id);
    if (isNaN(number)) number = hashCode(id);

    return defaultAvatarModule.DEFAULT_AVATARS[Math.abs(number % defaultAvatarModule.DEFAULT_AVATARS.length)];
  }

  return getRandomItem(defaultAvatarModule.DEFAULT_AVATARS);
}

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

export function createNullObject<T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(properties?: T, name?: string): T {
  let descriptors: { [key: PropertyKey]: PropertyDescriptor } = {};
  if (properties) {
    descriptors = Object.getOwnPropertyDescriptors(properties);
  }

  if (typeof name === "string") {
    descriptors[Symbol.toStringTag] = { value: name };
  }

  return Object.create(null, descriptors);
};
// 'Iterator.from' polyfill like thing
export function iteratorFrom<T>(iterator: Iterable<T>): IterableIterator<T> {
  if (typeof (window as any).Iterator === "function") {
    return (window as any).Iterator.from(iterator);
  }

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
    value: function*() {
      let result: IteratorResult<T, any>;
      while ((result = generator.next(), !result.done)) {
        yield result.value;
      };
    }
  });

  Object.setPrototypeOf(data, proto);

  return Object.setPrototypeOf({}, data);
};

const VXNodeListPrivate = new WeakMap<VXNodeList<Node>, Node[]>();
export class VXNodeList<T extends Node> {
  constructor(nodes: T[] = [ ]) {
    const nodesList = Array.from(nodes).filter((node) => node instanceof Node);
    VXNodeListPrivate.set(this, nodesList);

    let counter = 0;
    for (const node of nodesList) {
      this[counter++] = node;
    }
  }

  [key: number]: T;

  querySelector(selectors: string): T | null {
    for (const node of this) {
      if (!(node instanceof Element)) continue;
      if (node.matches(selectors)) return node;
    }

    return null;
  }
  querySelectorAll(selectors: string): VXNodeList<T> {
    const matches = [];

    for (const node of this) {
      if (!(node instanceof Element)) continue;
      if (node.matches(selectors)) matches.push(node);
    }

    return new VXNodeList(matches);
  }
  getElementById(id: string): T | null {
    for (const node of this) {
      if (!(node instanceof Element)) continue;
      if (node.id === id) return node;
    }

    return null;
  }

  includes(node: T | null): boolean {
    if (node === null) return false;
    return VXNodeListPrivate.get(this)!.includes(node);
  }

  get length() { return VXNodeListPrivate.get(this)!.length; }

  entries() {
    const gen = this.values();
    let result: IteratorResult<T, void>;
    let counter = 0;
    const entries: [ number, T ][] = [];

    while ((result = gen.next(), !result.done)) {
      entries.push([ counter++, result.value ]);
    }

    return iteratorFrom(entries);
  }

  keys() {
    const gen = this.values();
    let result: IteratorResult<T, void>;
    let counter = 0;
    const keys: number[] = [];

    while ((result = gen.next(), !result.done)) {
      keys.push(counter++);
    }

    return iteratorFrom(keys);
  }

  values(): IterableIterator<T> {
    return iteratorFrom(VXNodeListPrivate.get(this)! as T[]); 
  }

  item(index: number): T | null {
    return VXNodeListPrivate.get(this)!.at(index) as T | undefined ?? null;
  }

  forEach(callbackfn: (value: T, key: number, parent: VXNodeList<T>) => void, thisArg: any = this) {
    for (const [ key, node ] of this.entries()) {
      callbackfn.apply(thisArg, [ node, key, this ]);
    }
  }

  [Symbol.iterator]() {
    return iteratorFrom(VXNodeListPrivate.get(this)! as T[]); 
  }
};

export function getParents(element: Element | null): VXNodeList<Element> {
  if (!element) return new VXNodeList();

  const parents = [];

  while (element = element.parentElement) {
    parents.push(element);
  }
  
  return new VXNodeList(parents);
}

export function createAbort(): readonly [ (reason?: any) => void, () => AbortSignal ] {
  let controller = new AbortController();

  function abort(reason?: any) {
    controller.abort(reason);

    controller = new AbortController();
  }

  return [ abort, () => controller.signal ];
}

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
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

type NotFunction<T> = Exclude<T, Function>
export function memorize<T extends { [key in string]: () => any }>(instance: T & NotFunction<T>): { [key in keyof T]: ReturnType<T[key]> } {
  const clone = {} as { [key in keyof T]: ReturnType<T[key]> };

  for (const key in instance) {
    if (Object.prototype.hasOwnProperty.call(instance, key)) {
      const element = instance[key as keyof T];
      
      Object.defineProperty(clone, key, {
        get: cache(element)
      });
    }
  }

  return clone;
}

export function getDiscordTag(user: User) {
  const isPomelo = (user as any).isPomelo() || (user.discriminator === "0000");
  return [
    // isPomelo ? "@" : false,
    (user as any).globalName || user.username,
    !isPomelo ? `#${user.discriminator}` : false
  ].filter((m) => m).join("");
}

export function generateFaviconURL(website: string): string {
  const url = new URL("https://www.google.com/s2/favicons");
  url.searchParams.set("sz", "64");
  url.searchParams.set("domain", website);
  return url.href;
}

export function toArray<T>(itemOrItems: T | T[]): T[] {
  return Array.isArray(itemOrItems) ? itemOrItems : [ itemOrItems ];
}

export function createFluxComponent<T>(stores: FluxStore[] | FluxStore, factory: () => T) {
  const sym = Symbol("vx.flux.component");

  const $stores = toArray(stores);

  class FluxComponent<P = {}, S = {},  SS = {}> extends React.Component<P, S, SS> {
    constructor(props: P) {
      super(props);

      this.forceUpdateFluxState = this.forceUpdateFluxState.bind(this);
      
      const { componentWillUnmount, componentDidMount } = this;

      this.componentDidMount = function() {
        componentDidMount.call(this);

        if (!this[sym].componentDidMount) {
          logger.createChild("FluxComponent").warn("Original 'componentDidMount' wasn't ran! Make sure to do 'super.componentDidMount()'!");
          FluxComponent.prototype.componentDidMount.call(this);
        }
      }
      this.componentWillUnmount = function() {
        componentWillUnmount.call(this);

        if (!this[sym].componentWillUnmount) {
          logger.createChild("FluxComponent").warn("Original 'componentDidMount' wasn't ran! Make sure to do 'super.componentDidMount()'!");
          FluxComponent.prototype.componentWillUnmount.call(this);
        }
      }
    }

    public readonly fluxState: T = factory();
    private readonly [sym] = {
      componentDidMount: false,
      componentWillUnmount: false
    }
    
    protected forceUpdateFluxState(callback?: () => void) {
      (this as any).fluxState = factory();
      this.forceUpdate(callback);
    }

    public componentDidMount(): void {
      for (const store of $stores) {
        store.addChangeListener(this.forceUpdateFluxState);
      }
      this[sym].componentDidMount = true;
    }
    public componentWillUnmount(): void {
      for (const store of $stores) {
        store.removeChangeListener(this.forceUpdateFluxState);
      }
      this[sym].componentWillUnmount = true;
    }
  }

  return FluxComponent;
}

export let reactExists = false;
getLazyByKeys([ "memo", "createElement" ]).then(() => { reactExists = true; });

type Accessor<T> = (forceNoUseHook?: boolean) => T;
type SetterArg<T> = ((prev: T) => T) | T;
type Setter<T> = (value: SetterArg<T>) => T;
type State<T> = Readonly<[ Accessor<T>, Setter<T> ]>;

const stateValues = new WeakMap<Accessor<any> | Setter<any>, { listeners: Set<() => void>, accessor: Accessor<any> }>();
// SolidJS like thing
export function createState<T>(initialState: T): State<T> {
  let currentState = initialState;
  const listeners = new Set<() => void>();

  function accessor(forceNoUseHook = false) {
    if (!reactExists) return currentState;
    
    const dispatcher = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
    
    if (forceNoUseHook || !String(dispatcher.useSyncExternalStore).includes("349")) {
      return currentState;
    }    

    return useSyncExternalStore((onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange)
    }, () => currentState);
  }

  function setter(value: SetterArg<T>) {
    if (typeof value === "function") value = (value as (pref?: T) => T)(currentState);
    currentState = value;
    
    for (const listener of listeners) listener();

    return currentState;
  }
  
  stateValues.set(accessor, { listeners, accessor });
  stateValues.set(setter, { listeners, accessor });

  const state: State<T> = [
    accessor,
    setter
  ];

  return state;
}

export function monitorStateChange<T>(stateOrChild: Accessor<T> | Setter<T> | State<T>, onChange: (state: T) => void): () => void {
  if (typeof stateOrChild !== "function") stateOrChild = stateOrChild[0];
  
  const value = stateValues.get(stateOrChild);
  if (!value) throw new Error("State has no listeners!");

  function listener() {
    onChange(value!.accessor());
  }

  value.listeners.add(listener);
  return () => void value.listeners.delete(listener);
}

export function destructuredPromise<T extends any = void>() {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason: any) => void;
  const promise = new Promise<T>(($resolve, $reject) => {
    resolve = $resolve;
    reject = $reject;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

// [Symbol.hasInstance] overrides the native instanceof so this calls it
export function hasInstance(constructor: any, instance: any) {
  return Object[Symbol.hasInstance].call(constructor, instance);
}

interface TimeOptions {
  includeHours?: boolean,
  forceShowHours?: boolean,
  forceShowMinutes?: boolean,
  addExtraDegits?: boolean
}

export function simpleFormatTime(time: string | number | Date, options: TimeOptions = {}) {
  const { includeHours = false, forceShowHours = true, forceShowMinutes = true, addExtraDegits = false } = options;

  const seconds = Math.floor(new Date(time).getTime() / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const shouldShowHours = includeHours && Boolean(hours || forceShowHours);
  const shouldShowMinutes = shouldShowHours || forceShowMinutes || Boolean(minutes || addExtraDegits);

  function pad(time: number, addExtraDegits: boolean) {
    if (addExtraDegits) return String(time).padStart(2, "0");
    return String(time);
  }

  return `${shouldShowHours ? `${hours}:` : ""}${shouldShowMinutes ? `${pad(minutes % 60, shouldShowHours || addExtraDegits)}:` : ""}${pad(seconds % 60, shouldShowMinutes || addExtraDegits)}`;
}

export function getInternalInstance(node?: Node): Fiber | null {
  return node?.__reactFiber$ || null;
}
export function getOwnerInstance<P = {}, S = {}, SS = any>(instance: Fiber | Node | null): Component<P, S, SS> | null {
  if (instance instanceof Node) instance = getInternalInstance(instance);

  if (!instance) return null;

  const fiber = findInTree<Fiber>(instance, (item) => item.stateNode instanceof Component, { walkable: [ "return" ] });
  if (!fiber) return null;

  return fiber.stateNode;
}

export function setRefValue<T>(ref: React.Ref<T> | void, value: T) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) (ref as React.MutableRefObject<T>).current = value;
}
