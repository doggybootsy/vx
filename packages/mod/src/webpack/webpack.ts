import { escapeRegex } from "../util";
import { plainTextPatches } from "./patches";

export const webpackAppChunk = window.webpackChunkdiscord_app ??= [];

export let webpackRequire: Webpack.Require | void;

webpackAppChunk.push([
  [ Symbol.for("VX") ],
  { },
  (wpr) => {
    // Sentry's wpr doesn't have a lot of things
    if (!("b" in wpr)) return; 
    
    webpackRequire = wpr;

    for (const key in wpr.m) {
      if (Object.prototype.hasOwnProperty.call(wpr.m, key)) {
        set(wpr.m, key, wpr.m[key]);
      };
    };

    wpr.m = new Proxy(wpr.m, {
      set(modules, id, value: Webpack.RawModule) { return set(modules, id, value); }
    });

    wpr.d = (target, exports) => {
      for (const key in exports) {
        if (!Reflect.has(exports, key)) continue;
  
        Object.defineProperty(target, key, {
          get() { return exports[key]() },
          set(v) { exports[key] = () => v; },
          enumerable: true,
          configurable: true
        });
      }
    };
  }
]);

export const listeners = new Set<(module: Webpack.Module) => void>();

const getPrefix = /^(.*?)\(/;
// Functions like ones from objects ({ a() {} }) will throw so we replace 'a' with 'function'
function toStringFunction(fn: Function) {
  const stringed = fn.toString();
  const match = stringed.match(getPrefix);

  if (!match || !match[1]) return stringed;

  if (match[1].includes("=>") && !/^[\['"]/.test(match[1])) {
    return stringed;
  };

  if (!match[1]) return stringed;

  return stringed.replace(match[1], "function");
};

function set(modules: Record<PropertyKey, Webpack.RawModule>, key: PropertyKey, module: Webpack.RawModule): boolean {
  let stringedModule = toStringFunction(module).replace(/[\n]/g, "");
  const identifiers = new Set<string>();

  for (const patch of plainTextPatches) {
    if (typeof patch.match === "string" ? !stringedModule.includes(patch.match) : !patch.match.test(stringedModule)) continue;

    if (patch.identifier) identifiers.add(patch.identifier);

    if (!Array.isArray(patch.replacements)) patch.replacements = [ patch.replacements ];

    for (const replace of patch.replacements) {
      if (replace.predicate && !replace.predicate()) continue;
      
      if (typeof replace.replace === "string") {
        let replacer = replace.replace
          .replace(/\$react/g, "window.VX.React")
          .replace(/\$vx/g, "window.VX");

        if (patch._self) {
          for (const key in patch._self) {
            if (Object.prototype.hasOwnProperty.call(patch._self, key)) {
              const element = patch._self[key];
              replacer = replacer.replace(escapeRegex(`$${key}`, "g"), element);
            }
          }
        }

        stringedModule = stringedModule.replace(replace.find as any, replacer);
      }
      else stringedModule = stringedModule.replace(replace.find as any, replace.replace as any);
    };
  };
  
  stringedModule = `(()=>\n/*\n Module Id: ${key.toString()}${identifiers.size ? `\n Known string match identifiers '${Array.from(identifiers).join("', '")}'\n This doesn't mean they actually patched anything, just means they matched to it` : ""}\n*/\nfunction(){\n\t(${stringedModule}).apply(this, arguments);\n\twindow.VX._self._onWebpackModule.apply(this, arguments);\n}\n)()\n//# sourceURL=vx://VX/webpack-modules/${key.toString()}`;

  const moduleFN = (0, eval)(stringedModule);
  moduleFN.__VXOriginal = module;

  modules[key] = moduleFN;
  
  return true;
};

export function _onWebpackModule(module: Webpack.Module) {  
  for (const listener of listeners) listener(module);
};