import { wrapFilter, shouldSkipModule, getModule } from "renderer/webpack/searching";
import { chunkObj, filterOptions, module, moduleFilter } from "renderer/webpack/types";

const listeners = new Set<(module: module) => void>();

function patchPush() {
  const webpackChunkObject = (window as any).webpackChunkdiscord_app;

  function createPush(push: Function) {
    function handlePush(this: any, chunk: chunkObj) {
      const [, modules] = chunk;

      for (const id in modules) {
        if (Object.prototype.hasOwnProperty.call(modules, id)) {
          const moduleFN = modules[id];
          
          modules[id] = function(module, exports, require) {
            const ret = moduleFN(module, exports, require);

            for (const listener of listeners) listener(module);

            return ret;
          };

          // @ts-expect-error
          modules[id].__original = moduleFN;

          modules[id].toString = () => moduleFN.toString();
        };
      };

      return push.call(this, chunk);
    };
    
    return push === Array.prototype.push ? () => handlePush : handlePush;
  };

  Object.defineProperty(webpackChunkObject, "push", {
    configurable: true,
    get: createPush(webpackChunkObject.push) as () => any,
    set: (val) => {
      Object.defineProperty(webpackChunkObject, "push", {
        value: createPush(val),
        configurable: true,
        writable: true
      });
    }
  });
};
patchPush();

export function getLazy<type extends any>(filter: moduleFilter, opts: filterOptions & { signal?: AbortSignal } = {}): Promise<type> {
  filter = wrapFilter(filter);

  const cached = getModule<type>(filter, opts);  
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const { searchDefault = true, searchExports = false, signal } = opts;

    const undoListener = () => void listeners.delete(listener);

    function listener(module: module) {
      if (shouldSkipModule(module)) return;
      
      if (filter(module.exports, module, module.id)) {
        resolve(module.exports);
        return undoListener();
      };

      const keys: string[] = [ ];
      if (searchExports) keys.push(...Object.keys(module.exports));
      else if (searchDefault) keys.push("Z", "ZP", "default");

      for (const key of keys) {
        const item = module.exports[key];
        if (!item) continue;
        if (filter(item, module, module.id)) {
          resolve(item);
          return undoListener();
        };
      };
    };

    listeners.add(listener);

    if (signal) signal.addEventListener("abort", () => {
      reject(new Error("User aborted lazy module search"));
      undoListener();
    });
  });
};