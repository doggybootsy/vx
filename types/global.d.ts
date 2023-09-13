declare namespace VX {
  type PathLike = string;

  namespace modules {
    interface SimpleMarkdown {
      parse(text: string, idk?: unknown, state?: VX.Dict): React.ReactElement[],
      parseToAST(text: string, idk?: unknown, state?: VX.Dict): unknown,
      defaultRules: VX.Dict,
      astParserFor(rules: VX.Dict): VX.modules.SimpleMarkdown["parseToAST"],
      reactParserFor(rules: VX.Dict): VX.modules.SimpleMarkdown["parse"]
    };
  }

  type WatchAction = "deleted" | "change";

  interface NativeStorage {
    getAll(id: string): Record<string, any>,
    deleteItem(id: string, key: string): void,
    setItem(id: string, key: string, value: any): void,
    getItem<T = any>(id: string, key: string, defaultValue: T): T,
    hasItem(id: string, key: string): boolean
  };

  interface Native {
    path: typeof import("node:path"),
    readDir(dir: PathLike): string[],
    mkdir(dir: PathLike): void,

    readFile(file: string): string,
    readFile(file: string, encoding?: void): string,
    readFile(file: string, encoding: BufferEncoding): string,
    readFile(file: string, buffer: true): Uint8Array

    writeFile(file: PathLike, data: string): void,
    exists(path: PathLike): boolean,
    delete(path: PathLike): Promise<void>,
    watch(dir: PathLike, callback: (filename: PathLike, action: WatchAction) => void): () => void,
    openPath(path: PathLike): void,
    isDir(path: PathLike): boolean,
    stats(path: PathLike): import("node:fs").Stats,
    openExternal(url: string): void,
    dirname: string,
    platform: NodeJS.Platform,
    quit(restart?: boolean): void,
    storage: NativeStorage
  };
  
  type Environments = "main" | "preload" | "renderer";

  interface Environment {
    PRODUCTION: boolean,
    VERSION: string,
    ENVIROMENT: Environments,
    GITHUB: string
  };

  interface Dict<T = any> {
    [key: string]: T
  };

  interface FunctionWrap<T = any> {
    (): T
  };

  interface Ref<T = any> {
    current: T
  };

  type Enum<K = string, N = number> = Record<K, N> & Record<N, K>;
  type ConstEnum<K = string> = { [key in Uppercase<K>]: Lowercase<key> };
  type EnumKeys<E = Enum | ConstEnum> = E extends Enum ? E[number] : E[string];

  type NullAble<T> = T | void;

  type WrappedNative = FunctionWrap<Native>;
};

interface Window {
  VX: any,
  VXNative: VX.WrappedNative
};

interface PolyFilled {
  polyfilled: boolean;
};

interface MathClamp extends PolyFilled {
  (number: number, min: number, max: number): number;
};

interface Math {
  clamp: MathClamp
};

interface NodeListOf extends Iterable<Node> { };
interface NodeList extends Iterable<Node> { };

declare const __non_webpack_require__: NodeJS.Require | undefined;

declare const VXEnvironment: VX.Environment;
declare const VXNative: VX.WrappedNative;
