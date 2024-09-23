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
  interface Module<T extends any = any> {
    id: PropertyKey,
    exports: T,
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

  type ClassModule<K extends string[] = []> = Record<Exclude<string, K[number]>, string> & Record<K[number], string>; 
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
    assets: Asset[],
    name: string,
    body: string
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
  update(release: Git.Release): void,
  getCommunityThemes(): Promise<BetterDiscord.Addon[]>
}

type NativeObject = import("../packages/desktop/preload/native").NativeObject;

interface DiscordWindow {
  webpackChunkdiscord_app?: Webpack.AppObject,
  VXNative?: NativeObject,
  VXExtension?: ExtensionNative,
  DiscordNative?: DiscordNative,
  VX: ReturnType<typeof import("../packages/mod/src/window")["VX"]>
}

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
  
}

declare module "vx:self" {
  interface Enviroment {
    IS_DEV: boolean,
    VERSION: string,
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
  interface Component {
    render(this: this): ReactNode;
  }
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

declare const __jsx__ = Object.assign(React["createElement"], {
  createElement: React["createElement"],
  Fragment: React["Fragment"]
});

declare namespace Intl {
  interface ListFormatOptions {
    localeMatcher?: "best fit" | "lookup" | undefined;
    type?: "conjunction" | "disjunction" | "unit" | undefined;
    style?: "long" | "short" | "narrow" | undefined;
  }
  interface ListFormatResolvedOptions {
    type: "conjunction" | "disjunction" | "unit" | undefined;
    style: "long" | "short" | "narrow" | undefined;
    locale: string | undefined;
  }
  interface ListFormatPart {
    type: "element" | "literal";
    value: string;
  }
  interface ListFormat {
    format(list: string[]): string;
    formatToParts(list: string[]): ListFormatPart[];
    resolvedOptions(): ListFormatResolvedOptions; 
  }
  interface ListFormatConstructor {
    new (locales?: string | string[], options?: ListFormatOptions): ListFormat;
    prototype: ListFormat;

    supportedLocalesOf(locales?: string | string[], options?: ListFormatOptions): string[];
  }

  var ListFormat: ListFormatConstructor;
}

declare namespace BetterDiscord {
  interface Addon {
    id: number,
    name: string,
    type: "theme" | "plugin",
    description: string,
    author: Author,
    likes: number,
    downloads: number,
    tags: string[],
    thumbnail_url: string,
    latest_source_url: string,
    release_date: string,
    guild: Guild | null ,
    version: string
  }
  interface Author {
    github_id: string,
    github_name: string,
    display_name: string,
    discord_name: string,
    discord_avatar_hash: string,
    guild: Guild | null
  }
  interface Guild {
    name: string,
    snowflake: string,
    invite_link: string,
    avatar_hash: string
  }
}

interface FetchRequest extends Function {
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  
  text(input: RequestInfo | URL, init?: RequestInit): Promise<{ text: string, ok: boolean, response: Response }>;
  json<T>(input: RequestInfo | URL, init?: RequestInit): Promise<{ json: T, ok: boolean, response: Response }>;
  blob(input: RequestInfo | URL, init?: RequestInit): Promise<{ blob: Blob, ok: boolean, response: Response }>;
  arrayBuffer(input: RequestInfo | URL, init?: RequestInit): Promise<{ arrayBuffer: ArrayBuffer, ok: boolean, response: Response }>;
  formData(input: RequestInfo | URL, init?: RequestInit): Promise<{ formData: FormData, ok: boolean, response: Response }>;
}

declare const request: FetchRequest;

interface Cache<T> {
  /**
   * Calls the factory function
   * If only the value hasn't been set or if the call count is over {@link LIMIT}
   */
  (): T,
  /**
   * Calls the factory function
   * If only the value hasn't been set or if the call count is over {@link LIMIT}
   */
  readonly get: T,
  /**
   * Checks to see if a value has been cached
   */
  readonly hasValue(): boolean,
  /**
   * Completly resets the cache factory
   */
  readonly reset(): void,
  /**
   * Sets the call limit until it resets
   */
  CALL_LIMIT: number
}

declare function cache<T>(factory: () => T): Cache<T>;

declare const __self__: Record<string, any>;