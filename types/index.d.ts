declare module Webpack {
  interface Require extends Function {
    (id: PropertyKey): any;
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
  Sass?: Sass
};

type NativeObject = import("../packages/desktop/preload/native").NativeObject;
declare global {
  interface Window extends DiscordWindow {};
}
interface Window extends DiscordWindow {};

declare module "*.css" {};
declare module "*.css?managed" {
  export const css: string;
  export function addStyle(document?: Document): void;
  export function removeStyle(document?: Document): void;
};

declare module "*.html" {
  const type: Document;
  export default type;
};
declare module "@plugins" {};

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
