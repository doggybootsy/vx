import { proxyCache } from "../util";
import { byStrings } from "./filters";
import { getModule } from "./searching";
import { webpackRequire } from "@webpack";

export function getProxy<T extends Record<PropertyKey, any>>(filter: Webpack.Filter, opts?: Webpack.FilterOptions): T {
  return proxyCache(() => getModule(filter, opts)!);
}

export function getModuleIdBySource(...sources: string[]) {
  const filter = byStrings(...sources);
  
  if (!webpackRequire) return;

  for (const key in webpackRequire.m) {
    if (Object.prototype.hasOwnProperty.call(webpackRequire.m, key)) {
      const module = webpackRequire.m[key];
      
      if (filter(module)) return key;
    }
  }
}