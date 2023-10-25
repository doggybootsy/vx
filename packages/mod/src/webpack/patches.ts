export type PlainTextPatchType = PlainTextPatch | PlainTextPatchNonArray | PlainTextPatchReplacer;

interface PlainTextPatchBase {
  identifier?: string,
  _self?: string
};

export interface PlainTextPatch extends PlainTextPatchBase {
  match: string | RegExp,
  replacements: PlainTextReplacer[]
};
interface PlainTextPatchNonArray extends PlainTextPatchBase {
  match: string | RegExp,
  replacements: PlainTextReplacer
};

type PlainTextPatchReplacer = PlainTextReplacer & PlainTextPatchBase & {
  match?: string | RegExp,
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

export const plainTextPatches: PlainTextPatch[] = [
  // Remove the hash thats appended to react element keys, ex 'Element.__reactFiber$'
  {
    identifier: "VX(react-reconciler)",
    match: "__reactFiber$",
    replacements: [
      {
        find: /(var (.{1,3}))=Math.random\(\).toString\(36\).slice\(2\)/,
        replace: "$1=''"
      }
    ]
  }
];

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
  };
};