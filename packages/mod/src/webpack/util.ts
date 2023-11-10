import { proxyCache } from "../util";
import { byStrings } from "./filters";
import { getModule } from "./searching";
import { modules } from "./webpack";

export function getProxy<T extends Record<PropertyKey, any>>(filter: Webpack.Filter, opts?: Webpack.FilterOptions): T {
  return proxyCache(() => getModule(filter, opts)!);
};

export function getModuleIdBySource(...sources: string[]) {
  const filter = byStrings(...sources);

  for (const key in modules) {
    if (Object.prototype.hasOwnProperty.call(modules, key)) {
      const module = modules[key];
      
      if (filter(module)) return key;
    };
  };
};