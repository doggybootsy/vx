export interface PlainTextPatch {
  identifier?: string,
  match: string | RegExp,
  replacements: PlainTextReplacer[],
  _self?: string
};

interface PlainTextReplacerString {
  predicate?: () => boolean,
  find: string,
  replace: string
};
interface PlainTextReplacerFunction {
  predicate?: () => boolean,
  find: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; },
  replace: (substring: string, ...args: any[]) => string
};
interface PlainTextReplacerSymbolString {
  predicate?: () => boolean,
  find: { [Symbol.replace](string: string, replaceValue: string): string; },
  replace: string
};
interface PlainTextReplacerSymbolFunction {
  predicate?: () => boolean,
  find: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; },
  replace: (substring: string, ...args: any[]) => string
};
export type PlainTextReplacer = PlainTextReplacerFunction | PlainTextReplacerSymbolFunction | PlainTextReplacerSymbolString | PlainTextReplacerString;

export const plainTextPatches: PlainTextPatch[] = [
  {
    identifier: "VX(react-reconciler)",
    match: "__reactFiber$",
    replacements: [
      {
        find: /(var (.{1,3})=)Math.random\(\).toString\(36\).slice\(2\)/,
        replace: "$1''"
      }
    ]
  }
];