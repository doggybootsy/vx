import { getModule, listeners } from ".";
import { shouldSearchDefault, shouldSkipModule, wrapFilter } from "./shared";

export function getLazy<T extends Record<PropertyKey, any>>(filter: Webpack.Filter, opts: Webpack.LazyFilterOptions = {}): Promise<T> {
  filter = wrapFilter(filter);

  const cached = getModule<T>(filter, opts);  
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const { searchDefault = true, searchExports = false, signal } = opts;

    const undoListener = () => void listeners.delete(listener);

    function listener(module: Webpack.Module) {
      if (shouldSkipModule(module)) return;
      
      if (filter.call(module, module.exports, module, module.id)) {
        resolve(module.exports);
        return undoListener();
      }

      const keys: string[] = [ ];
      if (searchExports) keys.push(...Object.keys(module.exports));
      else if (searchDefault && shouldSearchDefault(module)) keys.push("default");

      for (const key of keys) {
        const exported = module.exports[key];
        
        if (!(exported instanceof Object)) continue;
        if (!Reflect.has(module.exports, key)) continue;

        if (filter.call(module, exported, module, module.id)) {
          resolve(exported);
          return undoListener();
        }
      }
    }

    listeners.add(listener);

    if (signal) {
      signal.addEventListener("abort", () => {
        reject(new Error("User aborted lazy module search"));
        undoListener();
      })
    };
  });
};