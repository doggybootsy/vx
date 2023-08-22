type anyFN = (...args: any[]) => any;

export function debounce<f extends anyFN>(handler: f, timeout?: number | undefined): (...args: Parameters<f>) => Promise<ReturnType<f>> {
  let timer: number;
  let resolve: void | ((returnValue: ReturnType<f>) => void);
  return function(this: any) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      const returnValue = handler.apply(this, Array.from(arguments));
      if (typeof resolve === "function") resolve(returnValue);
      resolve = undefined;
    }, timeout) as unknown as number;

    return new Promise((r) => {
      const pre = resolve;

      resolve = (returnValue) => {
        if (typeof pre === "function") pre(returnValue);
        r(returnValue);
      };
    })
  } as unknown as f;
};

import type { Fiber } from "react-reconciler";

export function getInternalInstance(node: Element): Fiber | void {
  const key = Object.keys(node).find((key) => key.startsWith("__reactFiber$"));
  if (!key) return;
  return node[key];
};

export function isURL(url: string | URL) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  };
};

export function findInTree<T>(tree: any, searchFilter: (item: any) => any, options: {
  walkable?: string[] | null,
  ignore?: string[]
} = {}): T | void {
  const { walkable = null, ignore = [] } = options;

  if (searchFilter(tree)) return tree as T;

  if (typeof tree !== "object" || tree == null) return undefined;

  let tempReturn;
  if (tree instanceof Array) {
    for (const value of tree) {
      tempReturn = findInTree(value, searchFilter, { walkable, ignore });
      if (typeof tempReturn != "undefined") return tempReturn;
    }
  }
  else {
    const toWalk = walkable == null ? Object.keys(tree) : walkable;
    for (const key of toWalk) {
      if (typeof(tree[key]) == "undefined" || ignore.includes(key)) continue;
      tempReturn = findInTree(tree[key], searchFilter, { walkable, ignore });
      if (typeof tempReturn != "undefined") return tempReturn;
    }
  }
  return tempReturn;
};

export function findInReactTree<T>(tree: any, searchFilter: (item: any) => any): T | void {
  return findInTree(tree, searchFilter, { walkable: [ "children", "props" ] });
};

export function getOwnerInstance(node: Element): React.Component | null
export function getOwnerInstance(instance: Fiber): React.Component | null
export function getOwnerInstance(nodeOrInstance: Element | Fiber): React.Component | null {
  if (nodeOrInstance instanceof Element) {
    nodeOrInstance = getInternalInstance(nodeOrInstance)!;
    if (!nodeOrInstance) return null;
  }

  const fiber = findInTree(nodeOrInstance, (item) => item.stateNode?.forceUpdate, { walkable: [ "return" ] });
  if (!fiber) return null;

  return (fiber as { stateNode: React.Component }).stateNode ?? null;
};

interface waitForNodeOptions {
  target?: Node,
  signal?: AbortSignal
};

export function waitForNode(query: string, options: waitForNodeOptions = {}): Promise<Element> {
  const { target = document, signal } = options;

  const exists = document.querySelector(query);
  if (exists) return Promise.resolve(exists);

  return new Promise<Element>((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of (mutation.addedNodes as unknown as Element[])) {
          if (!(addedNode instanceof Element)) continue;

          if (addedNode.matches(query)) {
            resolve(addedNode);
  
            observer.disconnect();
            return;
          };
  
          const element = addedNode.querySelector(query);
          if (element) {
            resolve(element);

            observer.disconnect();
          };
        }
      }
    });
  
    observer.observe(target, {
      subtree: true,
      childList: true
    });

    if (signal) {
      signal.addEventListener("abort", () => {
        reject(new DOMException("The user aborted a request"));

        observer.disconnect();
      });
    }
  });
};

interface classNameValueTypes {
  array: Array<string | void | classNameValueTypes["object"]>
  object: Record<string, boolean>
}

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
    }

    for (const key in className) {
      if (Object.prototype.hasOwnProperty.call(className, key)) {
        if (className[key]) flattenedString.push(parseString(key));
      }
    }
  };

  return Array.from(new Set(flattenedString)).join(" ");
}

// cache(() => webpack.getStore("UserStore"))();
const cacheSymbol = Symbol.for("VX.cache");

export interface CacheReturnType<T> {
  /**
   * @description A function version of accessing the cache
   * @example
   * const module = cache(() => Some Cache);
   * 
   * module() // Some Cache
   */
  (): T;
  /**
   * @description A getter version of accessing the cache.
   * Most use cases should be with JSX
   * @example
   * const module = cache(() => Some Cache);
   * 
   * module.getter // Some Cache
   */
  getter: T;
  /**
   * @description Minified version of {@link CacheReturnType.getter} 
   */
  g: T;
  /**
   * @description Clears the value of the cache target. 
   * Returns true if the cache had a value and false if it didn't
   * @example
   * let runCount = 0;
   * const cached = cache(() => runCount++);
   * 
   * cached.clear() // false
   * 
   * cached() // 0
   * 
   * cached.clear() // true
   * cached() // 1
   */
  clear(): boolean;
  /**
   * @description Internal
   */
  [cacheSymbol]: { current: T | null, hasValue: boolean };
};

export function cache<T>(factory: () => T): CacheReturnType<T> {  
  const cached: { current: T | null, hasValue: boolean } = { current: null, hasValue: false };

  function cacheFactory() {
    if (cached.hasValue) return cached.current!;
    
    cached.current = factory();
    cached.hasValue = true;

    return cached.current;
  };

  cacheFactory.clear = () => {
    if (!cached.hasValue) return false;

    cached.hasValue = false;
    cached.current = null;

    return true;
  };
  cacheFactory[cacheSymbol] = cached;
  Object.defineProperty(cacheFactory, "getter", {
    get: () => cacheFactory()
  });
  Object.defineProperty(cacheFactory, "g", {
    get: () => cacheFactory()
  });
  
  return cacheFactory as CacheReturnType<T>;
};

// const node = document.createElement("template");
// export function inlineCSSToString(declarations: Partial<Omit<CSSStyleDeclaration, number | "getPropertyCSSValue" | "parentRule" | "cssText" | "cssFloat" | "getPropertyPriority" | "getPropertyValue" | "item" | "removeProperty" | "setProperty">>) {
//   node.removeAttribute("style");

//   for (const key in declarations) {
//     node.style.setProperty(key, declarations[key]);
//   }

//   return node.style.cssText;
// };

export function whenDocumentReady<T = void>(then?: () => T): Promise<T> {
  if (document.readyState !== "loading") return Promise.resolve().then(then);

  return new Promise<void>((resolve) => {
    document.addEventListener("DOMContentLoaded", () => resolve(), {
      once: true
    });
  }).then(then);
};
