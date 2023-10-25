import { waitForNode } from "common/dom";
import { bySource } from ".";
import { proxyCache } from "../util";
import { getModule } from "./searching";

export function getProxy<T extends Record<PropertyKey, any>>(filter: Webpack.Filter, opts?: Webpack.FilterOptions): T {
  return proxyCache(() => getModule(filter, opts)!);
};
export function getMangledProxy<T extends Record<PropertyKey, any>>(filter: Webpack.Filter | string, mangled: Record<string, (exports: any) => any>): T extends never ? Record<string, any> : T {
  return proxyCache(() => getMangled(filter, mangled));
};

export function getMangled<T extends Record<PropertyKey, any>>(filter: Webpack.Filter | string, mangled: Record<string, (exports: any) => any>): T extends never ? Record<string, any> : T {
  if (typeof filter === "string") filter = bySource(filter);

  const returnValue = {} as T extends never ? Record<string, any> : T;

  const module = getModule<Record<string, any>>((exports, module, id) => {
    if (!(exports instanceof Object)) return;
    return (filter as Webpack.Filter).call(module, exports, module, id);
  }, { searchDefault: false, searchExports: false });
  if (!module) return returnValue;

  const entries = Object.entries(mangled) as [ string, (exports: any) => any ][];

  for (const searchKey in module) {
    if (Object.prototype.hasOwnProperty.call(module, searchKey)) {      
      for (const [ key, filter ] of entries) {
        if (key in returnValue) continue;

        if (filter(module[searchKey])) {
          Object.defineProperty(returnValue, key, {
            get() { return module[searchKey]; },
            set(v) { return module[searchKey] = v; },
            enumerable: true,
            configurable: false
          });
        };
      }
    };
  };

  return returnValue;
};