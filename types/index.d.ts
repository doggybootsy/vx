declare module Webpack {
  interface Require extends Function {
    <T = any>(id: PropertyKey): T;
    d(target, exports): void;
    c: Record<PropertyKey, Module>;
    m: Record<PropertyKey, RawModule>;
    el(id: PropertyKey): Promise<unknown>;
  };
  interface Module {
    id: PropertyKey,
    exports: any,
    loaded: boolean
  };
  type RawModule = (module: Module, exports: object, require: Require) => void;
  
  type Filter = (this: Module, exported: any, module: Module, id: PropertyKey) => any;
  type ExportedOnlyFilter = (exported: any) => any;
  type FilterOptions = {
    searchExports?: boolean,
    searchDefault?: boolean
  };
  type BulkFilter = FilterOptions & {
    filter: Filter
  };
  type LazyFilterOptions = FilterOptions & { signal?: AbortSignal };

  type ModuleWithEffect = [
    Array<any>,
    Record<PropertyKey, RawModule>,
    (require: Require) => void
  ];
  type ModuleWithoutEffect = [
    Array<any>,
    Record<PropertyKey, RawModule>
  ];
  type AppObject = Array<ModuleWithoutEffect | ModuleWithEffect>;
};
declare module Git {
  interface Asset {
    name: string,
    url: string,
    content_type: string
  };

  interface Release {
    html_url: string,
    url: string,
    tag_name: string,
    assets: Asset[]
  };
}

interface DiscordNative {
  window: {
    USE_OSX_NATIVE_TRAFFIC_LIGHTS: boolean,
    supportsContentProtection?(): boolean,
    setContentProtection?(enabled: boolean): void
  }
};

interface ExtensionNative {
  id: string,
  update(release: Git.Release): void,
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
};

type sassCompilerData = {
  status: 1
} | {
  status: 0,
  text: string
}

interface Sass {
  style: Record<string, number>,
  compile(text: string, options: { style: number, indentedSyntax: boolean }, callback: (data: sassCompilerData) => void): void
}

interface DiscordWindow {
  webpackChunkdiscord_app?: Webpack.AppObject,
  VXNative?: NativeObject,
  VXExtension?: ExtensionNative,
  DiscordNative?: DiscordNative,
  Sass?: Sass,
  VX: typeof import("../packages/mod/src/api")["VX"]
};

type NativeObject = import("../packages/desktop/preload/native").NativeObject;
declare global {
  interface Window extends DiscordWindow {};
}
interface Window extends DiscordWindow {};

type Styler = import("@styler").Styler;

declare module "*.css" {};
declare module "*.css?managed" {
  export const id: string;
  export const css: string;
  export function addStyle(): void;
  export function removeStyle(): void;
  // export const styler: Styler;
};

declare module "*.html" {
  const type: Document;
  export default type;
};
declare module "@plugins" {
  const type: Record<string, any>;
  export = type;
};

declare module "uncompress.js" {
  export interface Entry {
    is_file: boolean,
    name: string,
    readData(cb: Callback<ArrayBuffer>): void,
    size_compressed: number,
    size_uncompressed: number
  };
  
  export interface Archive {
    archive_type: string,
    entries: Entry[]
  };

  export interface Callback<T> extends Function {
    (archive: T, err: Error | null): void
  };

  export function archiveOpenFile(file: File, password: string, callback: Callback<Archive>): void;
  export function archiveOpenFileAsync(file: File, password: string): Promise<Archive>;
}

declare module "self" {
  interface Enviroment {
    IS_DEV: boolean,
    VERSION: string,
    VERSION_HASH: string
  };
  interface Browser {
    runtime: { 
      getURL(path: string): string 
    }
  };
  interface GitDetails {
    branch: string, 
    hash: string, 
    hashShort: string, 
    url: string
  };

  type Git = (GitDetails & { exists: true }) | { exists: false };

  export const env: Enviroment;
  export const browser: Readonly<Browser>;
  export const git: Git;
  export const IS_DESKTOP: boolean;
};
