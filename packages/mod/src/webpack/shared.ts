const TypedArray = Object.getPrototypeOf(Uint8Array);
export function shouldSkipModule(module: Webpack.Module) {
  if (module.exports === undefined || module.exports === null) return true;
  if (module.exports instanceof Window) return true;
  if (module.exports instanceof TypedArray) return true;
  if (module.exports === Symbol) return true;
  if (module.exports[Symbol.toStringTag] === "DOMTokenList") return true;
  if (!(module.exports instanceof Object)) return true;
  return false;
};

export function wrapFilter(filter: Webpack.Filter): Webpack.Filter {
  let hasErrored = false;
  return (exported, module, id) => {
    try { return filter.call(module, exported, module, id); }
    catch (error) {
      if (hasErrored) return false;
      hasErrored = true;
      console.warn("Webpack Module Search Error", { filter, module, error, moduleId: id });
      return false
    };
  };
};

export function shouldSearchDefault(module: Webpack.Module): boolean {
  if (!Reflect.has(module.exports, "__esModule")) return false;
  if (!module.exports.__esModule) return false;
  return "default" in module.exports;
};