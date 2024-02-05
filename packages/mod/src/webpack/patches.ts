import { env } from "vx:self";

export type PlainTextPatchType = PlainTextPatch | PlainTextPatchNonArray | PlainTextPatchReplacer;

interface PlainTextPatchBase {
  identifier?: string,
  _self?: Record<string, string>
};

export interface PlainTextPatch extends PlainTextPatchBase {
  match: string | RegExp | ((module: string) => boolean),
  replacements: PlainTextReplacer[]
};
interface PlainTextPatchNonArray extends PlainTextPatchBase {
  match: string | RegExp | ((module: string) => boolean),
  replacements: PlainTextReplacer
};

type PlainTextPatchReplacer = PlainTextReplacer & PlainTextPatchBase & {
  match?: string | RegExp | ((module: string) => boolean),
  find: string | RegExp
};

type Replacer = (substring: string, ...args: any[]) => string;

interface PlainTextReplacerString {
  predicate?: () => boolean,
  find: string,
  replace: string
};
interface PlainTextReplacerFunction {
  predicate?: () => boolean,
  find: { [Symbol.replace](string: string, replacer: Replacer): string; },
  replace: Replacer
};
interface PlainTextReplacerSymbolString {
  predicate?: () => boolean,
  find: { [Symbol.replace](string: string, replaceValue: string): string; },
  replace: string
};

export type PlainTextReplacer = PlainTextReplacerFunction | PlainTextReplacerSymbolString | PlainTextReplacerString;

export const plainTextPatches: PlainTextPatch[] = [];

addPlainTextPatch(
  // Remove the hash thats appended to react element keys, ex 'Element.__reactFiber$'
  {
    identifier: "VX(no-react-reconciler-hash)",
    match: "__reactFiber$",
    find: /(var (.{1,3}))=Math.random\(\).toString\(36\).slice\(2\)/,
    replace: "$1=''"
  }, 
  // Removes the 'HOLD UP' logs in console and prevents token hiding
  {
    identifier: "VX(no-hold-up)",
    match: ".window.setDevtoolsCallbacks",
    find: /.+/,
    replace: "function(module,exports,require){require.r(exports);require.d(exports,{default(){return ()=>{}}})}"
  },
  // Little loader icon in bottom left
  {
    identifier: "VX(loading-logo)",
    match: "opacity:this.state.opacity},children:[",
    find: /opacity:this\.state\.opacity},children:\[/,
    replace: `$&$react.createElement("div",{className:"vx-loader-icon",title:"VX v${env.VERSION}",children:$react.createElement($vx.components.Icons.Logo)}),`
  },
  // Prevents localStorage and sessionStorage from getting deleted
  ...[ "localStorage", "sessionStorage" ].map((type) => ({
    identifier: `VX(save-${type})`,
    find: `delete window.${type}`,
    replace: ""
  })),
  {
    identifier: "VX(lazy-store)",
    match: "Store.waitFor(...)",
    find: /,.{1,3}\.push\(this\),/,
    replace: "$&$vx.webpack.__raw._lazyStore(this),"
  }
);

export function addPlainTextPatch(...patches: PlainTextPatchType[]) {
  for (const patch of patches) {
    const asReplacer = patch as PlainTextPatchReplacer;
    if (typeof asReplacer.find !== "undefined") {
      const newPatch: PlainTextPatch = {
        _self: asReplacer._self,
        identifier: asReplacer.identifier,
        match: asReplacer.match || asReplacer.find,
        replacements: [
          {
            find: asReplacer.find,
            predicate: asReplacer.predicate,
            replace: asReplacer.replace
          } as any
        ]
      };

      plainTextPatches.push(newPatch);

      continue;
    };

    const asNormal = patch as PlainTextPatch | PlainTextPatchNonArray;
    
    if (!Array.isArray(asNormal.replacements)) asNormal.replacements = [ asNormal.replacements ];
    
    const newPatch: PlainTextPatch = {
      _self: asNormal._self,
      identifier: asNormal.identifier,
      match: asNormal.match,
      replacements: asNormal.replacements
    };
    
    plainTextPatches.push(newPatch);
  }
}
