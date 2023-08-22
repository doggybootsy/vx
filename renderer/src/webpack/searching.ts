import { WebpackRequire, filterOptions, moduleFilter, module } from "renderer/webpack/types";
import { logger } from "renderer/logger";

export let webpackRequire: WebpackRequire | void;

function patchD() {
  // BD's require.d patch
  webpackRequire!.d = (target, exports) => {
    for (const key in exports) {
      if (!Reflect.has(exports, key) || target[key]) continue;

      Object.defineProperty(target, key, {
        get: () => exports[key](),
        set: v => {exports[key] = () => v;},
        enumerable: true,
        configurable: true
      });
    }
  };
};

const webpackChunkObject = (window as unknown as { webpackChunkdiscord_app: any[] }).webpackChunkdiscord_app ??= [ ];

webpackChunkObject.push([
  [ Symbol("VX") ],
  { },
  (wpRequire: WebpackRequire) => {
    webpackRequire = wpRequire;

    patchD();
  }
]);

const TypedArray = Object.getPrototypeOf(Uint8Array);
export function shouldSkipModule(module: module) {
  if (module.exports === undefined || module.exports === null) return true;
  if (module.exports instanceof Window) return true;
  if (module.exports instanceof TypedArray) return true;
  if (module.exports === Symbol) return true;
  if (module.exports[Symbol.toStringTag] === "DOMTokenList") return true;
  if (typeof module.exports === "string") return true;
  return false;
};

export function wrapFilter(filter: moduleFilter): moduleFilter {
  let hasErrored = false;
  return (exported, module, id) => {
    try { return filter.call(undefined, exported, module, id); }
    catch (error) {
      if (hasErrored) return;
      hasErrored = true;
      logger.warn("Webpack Module Search Error", "\nFilter:", filter, "\nthrew:", error, "\nmodule", module);
    };
  };
};

export function getModule<type extends any>(filter: moduleFilter, opts: filterOptions = {}): void | type {
  filter = wrapFilter(filter);
  
  if (!webpackRequire) return;

  const { searchDefault = true, searchExports = false } = opts;

  for (const id in webpackRequire.c) {
    if (Object.prototype.hasOwnProperty.call(webpackRequire.c, id)) {
      const module = webpackRequire.c[id];

      if (shouldSkipModule(module)) continue;
      
      if (filter(module.exports, module, id)) return module.exports;

      const keys: string[] = [ ];
      if (searchExports) keys.push(...Object.keys(module.exports));
      else if (searchDefault) keys.push("Z", "ZP", "default");

      for (const key of keys) {
        const item = module.exports[key];
        if (!item) continue;
        if (filter(item, module, id)) return item;
      };
    };
  };
};
export function getAllModules<type extends any[]>(filter: moduleFilter = () => true, opts: filterOptions = {}): type {
  filter = wrapFilter(filter);
    
  const modules = [ ] as any[];
    
  if (!webpackRequire) return modules as unknown as type;

  const { searchDefault = true, searchExports = false } = opts;

  for (const id in webpackRequire.c) {
    if (Object.prototype.hasOwnProperty.call(webpackRequire.c, id)) {
      const module = webpackRequire.c[id];

      if (shouldSkipModule(module)) continue;
      
      if (filter(module.exports, module, id)) modules.push(module.exports);

      const keys: string[] = [ ];
      if (searchExports) keys.push(...Object.keys(module.exports));
      else if (searchDefault) keys.push("Z", "ZP", "default");

      for (const key of keys) {
        const item = module.exports[key];
        if (!item) continue;
        if (filter(item, module, id)) modules.push(item);
      };
    };
  };

  return modules as unknown as type;
};