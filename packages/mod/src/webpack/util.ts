import { DEBUG_SYMBOL, addDebug } from "../constants";
import { proxyCache } from "../util";
import { bySource, byStrings } from "./filters";
import { getModule } from "./searching";
import { webpackRequire } from "@webpack";

export function getProxy<T extends Record<PropertyKey, any>>(filter: Webpack.Filter, opts?: Webpack.FilterOptions): T {
  return proxyCache(() => getModule(filter, opts)!);
}

export function getModuleIdBySource(...sources: string[]) {
  const filter = byStrings(...sources);
  
  if (!webpackRequire) return null;

  for (const key in webpackRequire.m) {
    if (!Object.prototype.hasOwnProperty.call(webpackRequire.m, key)) continue;
    if (filter(webpackRequire.m[key])) return key;
  }

  return null;
}

export function getMangled<T extends Record<PropertyKey, any>>(filter: Webpack.Filter | string | RegExp, mangled: Record<string, Webpack.ExportedOnlyFilter>): T extends never ? Record<string, any> : T {
  if (typeof filter === "string" || filter instanceof RegExp) filter = bySource(filter);

  const returnValue = {} as T extends never ? Record<string, any> : T;

  const module = getModule<Record<string, any>>((exports, module, id) => {
    if (!(exports instanceof Object)) return;
    return (filter as Webpack.Filter).call(module, exports, module, id);
  }, { searchDefault: false, searchExports: false });

  addDebug(returnValue, module);
  
  if (!module) return returnValue;

  const entries = Object.entries(mangled) as [ string, Webpack.ExportedOnlyFilter ][];

  for (const searchKey in module) {
    if (!Object.prototype.hasOwnProperty.call(module, searchKey)) continue;
    for (const [ key, filter ] of entries) {
      if (key in returnValue) continue;

      if (filter(module[searchKey])) {
        Object.defineProperty(returnValue, key, {
          get() { return module[searchKey]; },
          set(v) { return module[searchKey] = v; },
          enumerable: true,
          configurable: false
        });
      }
    }
  }

  return returnValue;
}

export function getMangledProxy<T extends Record<PropertyKey, any>>(filter: Webpack.Filter | string | RegExp, mangled: Record<keyof T, Webpack.ExportedOnlyFilter>): T extends never ? Record<string, any> : T {
  const proxy = proxyCache(() => getMangled(filter, mangled), true);
  const obj = { };

  for (const key in mangled) {
    if (!Object.prototype.hasOwnProperty.call(mangled, key)) continue;
    Object.defineProperty(obj, key, {
      get: () => proxy[key],
      set: (v) => proxy[key] = v,
      enumerable: true
    })
  }

  Object.defineProperty(obj, DEBUG_SYMBOL, {
    get: () => proxy[DEBUG_SYMBOL]
  })

  return obj as T extends never ? Record<string, any> : T
}