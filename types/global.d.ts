declare namespace VX {
  type PathLike = string;

  interface Native {
    path: typeof import("node:path"),
    readDir(dir: PathLike): string[],
    mkdir(dir: PathLike): void,
    readFile(file: PathLike): string,
    writeFile(file: PathLike, data: string): void,
    exists(path: PathLike): boolean,
    delete(path: PathLike): Promise<void>,
    watch(dir: PathLike, callback: (filename: PathLike, action: "deleted" | "change") => void): () => void,
    openPath(path: PathLike): void,
    isDir(path: PathLike): boolean,
    stats(path: PathLike): import("node:fs").Stats,
    openExternal(url: string): void,
    dirname: string,
    platform: NodeJS.Platform,
    quit(restart?: boolean): void
  };
  
  interface Environment {
    PRODUCTION: boolean,
    VERSION: string,
    ENVIROMENT: "main" | "preload" | "renderer"
  };

  interface Dict<T = any> {
    [key: string]: T
  };
  interface FunctionWrap<T = any> {
    (): T
  };
};

interface Window {
  VX: any,
  VXNative: VX.FunctionWrap<VX.Native>
};

declare const __non_webpack_require__: NodeJS.Require | undefined;

declare const VXEnvironment: VX.Environment;
declare const VXNative: VX.FunctionWrap<VX.Native>;