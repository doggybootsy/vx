import { getModule, listeners } from ".";
import { shouldSkipModule, wrapFilter } from "./shared";

export function getLazy<T>(filter: Webpack.Filter, opts: Webpack.LazyFilterOptions = {}): Promise<T> {
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
      };

      const keys: string[] = [ ];
      if (searchExports) keys.push(...Object.keys(module.exports));
      else if (searchDefault) keys.push("Z", "ZP", "default");

      for (const key of keys) {
        const item = module.exports[key];
        if (!item) continue;
        if (filter.call(module, item, module, module.id)) {
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