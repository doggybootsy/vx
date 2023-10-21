declare module Webpack {
  interface Require {
    (id: PropertyKey): any;
    d(target, exports): void;
    c: Record<PropertyKey, Module>;
    m: Record<PropertyKey, RawModule>;
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
    Array<symbol, string, number>,
    Record<PropertyKey, RawModule>,
    (require: Require) => void
  ];
  type ModuleWithoutEffect = [
    Array<symbol, string, number>,
    Record<PropertyKey, RawModule>
  ];
  type AppObject = Array<ModuleWithoutEffect | ModuleWithEffect>;
};

type NativeObject = import("../packages/desktop/preload/native").NativeObject;
declare global {
  interface Window {
    webpackChunkdiscord_app?: Webpack.AppObject,
    VXNative?: NativeObject
  };
}
interface Window {
  webpackChunkdiscord_app?: Webpack.AppObject,
  VXNative?: NativeObject
};

declare type SNOWFLAKE = `${bigint}`;

declare module "*.css" {};
declare module "*.html" {
  const type: Document;
  export default type;
};
declare module "@plugins" {};

declare module "self" {
  interface Enviroment {
    IS_DEV: boolean,
    VERSION: string
  };
  interface Browser {
    runtime: { 
      getURL(path: string): string 
    }
  };

  export const env: Enviroment;
  export const browser: Browser;
};