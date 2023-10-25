import { proxyCache } from "../util";
import { getModule } from "./searching";

export function getProxy<T extends Record<PropertyKey, any>>(filter: Webpack.Filter, opts?: Webpack.FilterOptions): T {
  return proxyCache(() => getModule(filter, opts)!);
};
