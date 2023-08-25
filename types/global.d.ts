declare namespace VX {
  type PathLike = string;

  type WatchAction = "deleted" | "change";

  interface Native {
    path: typeof import("node:path"),
    readDir(dir: PathLike): string[],
    mkdir(dir: PathLike): void,
    readFile(file: PathLike): string,
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
    quit(restart?: boolean): void
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

  type Enum<K = string, N = number> = Record<K, N> & Record<N, K>;
  type ConstEnum<K = string> = { [key in K]: Lowercase<key> };
  type EnumKeys<E = Enum | ConstEnum> = E extends Enum ? E[number] : E[string];

  type NullAble<T> = T | void;

  type WrappedNative = FunctionWrap<Native>;
};

interface Window {
  VX: any,
  VXNative: VX.WrappedNative
};

declare const __non_webpack_require__: NodeJS.Require | undefined;

declare const VXEnvironment: VX.Environment;
declare const VXNative: VX.WrappedNative;