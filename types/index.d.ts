// Gets a react components props
// Including HTML / SVG components
type BasicDOMProps = React.ClassAttributes<Element> & React.AnchorHTMLAttributes<Element>;

type GetPropsFromDOMFactory<T extends React.DetailedHTMLFactory> = T extends React.DetailedHTMLFactory<infer P, infer E> ? React.DetailedHTMLProps<P, E> : BasicDOMProps;
type GetDOMProps<T extends string> = T extends keyof React.ReactHTML ? GetPropsFromDOMFactory<React.ReactHTML[T]> : T extends keyof React.ReactSVG ? GetPropsFromDOMFactory<React.ReactSVG[T]> : BasicDOMProps;

type GetComponentProps<T> = T extends string ? GetDOMProps<T> : T extends React.ComponentType<infer P> ? P extends never ? {} : P extends unknown ? {} : NonNullable<P> : any;

declare module Webpack {
  interface Require extends Function {
    <T = any>(id: PropertyKey): T;
    d(target, exports): void;
    c: Record<PropertyKey, Module>;
    m: Record<PropertyKey, RawModule>;
    e(id: PropertyKey): Promise<unknown>;
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
  type SignalOption = { signal?: AbortSignal };
  type LazyFilterOptions = FilterOptions & SignalOption;

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
    content_type: string,
    browser_download_url: string
  };

  interface Release {
    html_url: string,
    url: string,
    tag_name: string,
    assets: Asset[]
  };
}

declare module Spotify {
  interface Image {
    height: number,
    width: number,
    url: string
  }

  interface Artist {
    external_urls: {
      spotify: string
    },
    href: string,
    id: string,
    name: string,
    type: "artist",
    uri: string
  }
  interface Album {
    id: string,
    name: string,
    image: Image
  }
  interface Track {
    name: string,
    album: Album,
    artists: Artist[],
    id: string,
    duration: number,
    isLocal: boolean,
  }
  
  interface Device {
    id: string,
    is_active: boolean,
    is_private_session: false,
    is_restricted: false,
    name: string,
    supports_volume: boolean,
    type: string,
    volume_percent: number
  }

  interface ArtistFull {
    external_urls: {
      spotify: string
    },
    followers: {
      href: null,
      total: number
    },
    genres: string[],
    href: string,
    id: string,
    images: Image[],
    name: string,
    popularity: number,
    type: "artist",
    uri: string
  }
  
  type ShuffleState = "off" | "context" | "track";
  type PageType = "artist" | "album" | "track";
}

interface RecordingOptions {
  echoCancellation?: boolean,
  noiseCancellation?: boolean
}

interface DiscordNativeModules {
  voice: {
    startLocalAudioRecording(options: RecordingOptions, callback: (ok: boolean) => void): void;
    stopLocalAudioRecording(callback: (filename: string, size: number) => void): void;
  }
}

interface DiscordNative {
  window: {
    USE_OSX_NATIVE_TRAFFIC_LIGHTS: boolean,
    supportsContentProtection?(): boolean,
    setContentProtection?(enabled: boolean): void
  },
  nativeModules: {
    ensureModule(module: `discord_${keyof DiscordNativeModules}`): Promise<void>,
    requireModule<K extends keyof DiscordNativeModules>(module: `discord_${K}`): DiscordNativeModules[K]
  }
}

interface ExtensionNative {
  id: string,
  update(release: Git.Release): void
}

interface DiscordWindow {
  webpackChunkdiscord_app?: Webpack.AppObject,
  VXNative?: NativeObject,
  VXExtension?: ExtensionNative,
  DiscordNative?: DiscordNative,
  VX: typeof import("../packages/mod/src/window")["VX"]
}

type NativeObject = import("../packages/desktop/preload/native").NativeObject;
declare global {
  interface Window extends DiscordWindow {};
}
interface Window extends DiscordWindow {};

type Styler = import("vx:styler").Styler;

declare module "*.css" {};

declare module "*.css?managed"
declare module "*.css?m" {
  export const id: string;
  export const css: string;
  export function addStyle(): void;
  export function removeStyle(): void;
  export function hasStyle(): boolean;
}

declare interface ManagedCSS {
  id: string,
  css: string,
  addStyle(): void,
  removeStyle(): void,
  hasStyle(): boolean
}

declare module "*.html" {
  const type: Document;
  export default type;
}
declare module "@plugins" {
  const type: Record<string, any>;
  export = type;
}

declare module "vx:self" {
  interface Enviroment {
    IS_DEV: boolean,
    VERSION: string,
    VERSION_HASH: string,
    RDT: {
      DOWNLOAD_URL: string,
      ID: string
    }
  }
  interface Browser {
    [key: string]: any
  }
  interface GitDetails {
    branch: string, 
    hash: string, 
    hashShort: string, 
    url: string
  }

  type Git = (GitDetails & { exists: true }) | { exists: false };

  export const env: Enviroment;
  export const browser: Readonly<Browser>;
  export const git: Git;
  export const IS_DESKTOP: boolean;
}

type CSSVariable = `--${string}`;
declare namespace React {
  // Add CSS Variables to 'React.CSSProperties'
  interface CSSProperties {
    [key: CSSVariable]: string | number
  }
}

interface Node {
  __reactFiber$?: import("react-reconciler").Fiber,
  __reactProps$?: any
}

declare type ChokidarFileEvent = "add" | "addDir" | "change" | "unlink" | "unlinkDir";

declare const __jsx__ = {
  createElement: React["createElement"],
  Fragment: React["Fragment"]
}
