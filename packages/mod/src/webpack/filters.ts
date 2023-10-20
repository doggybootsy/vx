import { getLazy } from "./lazy";
import { getModule } from "./searching";
import { getProxy } from "./util";
import { webpackRequire } from "./webpack";

export function bySource(source: string): Webpack.Filter {
  const filter = byStrings(source);
  return (exports, module, id) => {
    if (exports !== module.exports) return;
    
    const fn = webpackRequire!.m[id];
    return filter(fn);
  };
};
export function combine(...filters: Webpack.ExportedOnlyFilter[]): Webpack.ExportedOnlyFilter
export function combine(...filters: Webpack.Filter[]): Webpack.Filter {
  return (exports, module, id) => {
    for (const filter of filters) {
      if (!filter.call(module, exports, module, id)) return false;
    };
    return true;
  };
};
export function not(filter: Webpack.ExportedOnlyFilter): Webpack.ExportedOnlyFilter
export function not(filter: Webpack.Filter): Webpack.Filter {
  return (exports, module, id) => {
    return !filter.call(module, exports, module, id);
  };
};

export function byStrings(...strings: string[]): Webpack.ExportedOnlyFilter {
  return (exports) => {
    if (!(exports instanceof Function)) return;

    try {
      const stringed = Function.prototype.toString.call(exports);
      for (const string of strings) {
        if (!stringed.includes(string)) return;
      }
      return true;
    } 
    catch (error) {}
  }
};
export function getByStrings<T>(strings: string[], opts?: Webpack.FilterOptions) {
  return getModule<T>(byStrings(...strings), opts);
};
export function getProxyByStrings<T extends object>(keys: string[], opts?: Webpack.FilterOptions) {
  return getProxy<T>(byStrings(...keys), opts);
};
export function getLazyByStrings<T>(keys: string[], opts?: Webpack.FilterOptions) {
  return getLazy<T>(byStrings(...keys), opts);
};

export function byRegex(...regexes: RegExp[]): Webpack.ExportedOnlyFilter {
  return (exports) => {
    if (!(exports instanceof Function)) return;

    try {
      const stringed = Function.prototype.toString.call(exports);
      for (const regex of regexes) {
        if (!regex.test(stringed)) return;
      }
      return true;
    } 
    catch (error) {}
  }
};
export function getByRegex<T>(regexes: RegExp[], opts?: Webpack.FilterOptions) {
  return getModule<T>(byRegex(...regexes), opts);
};
export function getProxyByRegex<T extends object>(regexes: RegExp[], opts?: Webpack.FilterOptions) {
  return getProxy<T>(byRegex(...regexes), opts);
};
export function getLazyByRegex<T>(regexes: RegExp[], opts?: Webpack.FilterOptions) {
  return getLazy<T>(byRegex(...regexes), opts);
};

export function byKeys(...keys: string[]): Webpack.ExportedOnlyFilter {
  return (exports) => {
    if (!(exports instanceof Object)) return;

    for (const key of keys) {
      if (!Reflect.has(exports, key)) return;
    };

    return true;
  }
};
export function getByKeys<T>(keys: string[], opts?: Webpack.FilterOptions) {
  return getModule<T>(byKeys(...keys), opts);
};
export function getProxyByKeys<T extends object>(keys: string[], opts?: Webpack.FilterOptions) {
  return getProxy<T>(byKeys(...keys), opts);
};
export function getLazyByKeys<T>(keys: string[], opts?: Webpack.FilterOptions) {
  return getLazy<T>(byKeys(...keys), opts);
};

export function byProtoKeys(...keys: string[]): Webpack.ExportedOnlyFilter {
  const filter = byKeys(...keys);

  return (exports) => {
    if (!exports.prototype) return;

    return filter(exports.prototype);
  }
};
export function getByProtoKeys<T>(keys: string[], opts?: Webpack.FilterOptions) {
  return getModule<T>(byProtoKeys(...keys), opts);
};
export function getProxyByProtoKeys<T extends object>(keys: string[], opts?: Webpack.FilterOptions) {
  return getProxy<T>(byProtoKeys(...keys), opts);
};
export function getLazyByProtoKeys<T>(keys: string[], opts?: Webpack.FilterOptions) {
  return getLazy<T>(byProtoKeys(...keys), opts);
};
