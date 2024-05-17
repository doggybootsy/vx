import { logger } from "vx:logger";
import { compileFunction, destructuredPromise, escapeRegex, isInvalidSyntax } from "../util";
import { plainTextPatches } from "./patches";

export const webpackAppChunk = window.webpackChunkdiscord_app ??= [];

export let webpackRequire: Webpack.Require | void;

const webpackInit = destructuredPromise();
export function whenWebpackInit() {
  return webpackInit.promise;
}

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
      }
    }

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

    webpackInit.resolve();
  }
]);

export const listeners = new Set<(module: Webpack.Module) => void>();

const getPrefix = /^(.*?)\(/;
// Functions like ones from objects ({ a() {} }) will throw so we replace 'a' with 'function'
function toStringFunction(fn: Function) {
  const stringed = Function.prototype.toString.call(fn);
  const match = stringed.match(getPrefix);

  if (!match || !match[1]) return stringed;

  if (match[1].includes("=>") && !/^[\['"]/.test(match[1])) return stringed;

  if (!match[1]) return stringed;

  return stringed.replace(match[1], "function");
}

function set(modules: Record<PropertyKey, Webpack.RawModule>, key: PropertyKey, module: Webpack.RawModule): boolean {
  let stringedModule = toStringFunction(module).replace(/[\n]/g, "");
  const orignal = stringedModule;
  const identifiers = new Set<string>();

  for (const patch of plainTextPatches) {
    if (typeof patch.match === "string" ? !stringedModule.includes(patch.match) : typeof patch.match === "function" ? patch.match(stringedModule) : !patch.match.test(stringedModule)) continue;

    if (patch.identifier) identifiers.add(patch.identifier);

    if (!Array.isArray(patch.replacements)) patch.replacements = [ patch.replacements ];

    for (const replace of patch.replacements) {
      if (replace.predicate && !replace.predicate()) continue;
      
      if (typeof replace.replace === "string") {
        let replacer = replace.replace
          .replace(/\$react/g, "globalThis.VX.React")
          .replace(/\$jsx/g, "globalThis.VX.React.createElement")
          .replace(/\$vx/g, "globalThis.VX");

        if (patch._self) {
          for (const key in patch._self) {
            if (Object.prototype.hasOwnProperty.call(patch._self, key)) {
              replacer = replacer.replace(escapeRegex(`$${key}`, "g"), patch._self[key]);
            }
          }
        }

        stringedModule = stringedModule.replace(replace.find as any, replacer);
      }
      else stringedModule = stringedModule.replace(replace.find as any, replace.replace as any);
    }
  }

  const id = key.toString();
  const nid = Number(key);
  // When viewing the source tab having 100 thousand items render kills dom
  // so this breaks it up into folders (roughly 1000 folders that hold 100 files)
  const path = isNaN(nid) ? `nan/${id}.js` : `${Math.floor(nid / 1_000)}/${id}.js`;

  if (orignal === stringedModule) {
    const moduleFN = compileFunction<(__WEBPACK_MODULE__: Webpack.RawModule) => Webpack.RawModule & { __VXOriginal: Webpack.RawModule }>(`/*\n Module Id: ${id} (unpatched)\n*/\nreturn function() {\n\t__WEBPACK_MODULE__.apply(this, arguments);\n\twindow.VX._self._onWebpackModule.apply(this, arguments);};\n\n//# sourceURL=vx://VX/webpack-modules/unpatched/${path}`, [ "__WEBPACK_MODULE__" ]);
    
    const webpackModule = moduleFN(module);

    webpackModule.toString = () => module.toString();
    webpackModule.__VXOriginal = module;

    modules[key] = webpackModule;
    return true;
  }
  
  stringedModule = `(()=>\n/*\n Module Id: ${id}${identifiers.size ? `\n Known string match identifiers '${Array.from(identifiers).join("', '")}'\n This doesn't mean they actually patched anything, just means they matched to it` : ""}\n*/\nfunction(){\n\t(${stringedModule}).apply(this, arguments);\n\twindow.VX._self._onWebpackModule.apply(this, arguments);\n})()\n//# sourceURL=vx://VX/webpack-modules/patched/${path}`;

  const error = isInvalidSyntax(stringedModule);
  if (error) {
    logger.createChild("Webpack").warn(`Syntax Error on module '${id}' reverting to original module`, {
      code: stringedModule,
      identifiers: identifiers,
      error
    });

    modules[key] = module;
  }
  else {
    const moduleFN = (0, eval)(stringedModule);
    moduleFN.__VXOriginal = module;
  
    modules[key] = moduleFN;
  }
  
  return true;
}

export function _onWebpackModule(module: Webpack.Module) {  
  for (const listener of listeners) listener(module);
}