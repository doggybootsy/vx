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
  // Not in the public release!
  fetchArrayBuffer?(input: string): Promise<ArrayBuffer>,
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

declare namespace ReviewDB {
  const enum ReviewType {
    User = 0,
    Server = 1,
    Support = 2,
    System = 3
  }
  interface Badge {
    name: string,
    description: string,
    icon: string,
    redirectURL?: string,
    type: number
  }
  interface User {
    badges: Badge[],
    discordID: string,
    id: number,
    profilePhoto: string,
    username: string
  }
  interface CurrentUser extends User {
    clientMods: string[],
    lastReviewID: number,
    warningCount: number,
    banInfo: null | unknwon,
    blockedUsers: string[] | null,
    notification: null | unknown,
    type: number
  }
  interface Review {
    comment: string,
    id: number,
    replies: null | Review[],
    sender: User,
    type: ReviewType,
    star: number,
    timestamp: number
  }
  interface Reviews {
    hasNextPage: boolean,
    message: string,
    reviewCount: number,
    reviews: Review[],
    success: boolean
  }

  type ReviewRequest = { comment: string } & ({ repliesTo: number } | { id: number } | {});
}

declare interface PromiseResolvers<T> {
  promise: Promise<T>,
  reject(reason: any): void,
  resolve(value: T | PromiseLike<T>): void
}

interface PromiseConstructor {
  withResolvers<T>(): PromiseResolvers<T>
}


declare module 'highlight.js/private' {
	import { CompiledMode, Mode, Language } from "highlight.js";

	type MatchType = "begin" | "end" | "illegal"
	type EnhancedMatch = RegExpMatchArray & {rule: CompiledMode, type: MatchType}
	type AnnotatedError = Error & {mode?: Mode | Language, languageName?: string, badRule?: Mode}

	type KeywordData = [string, number];
	type KeywordDict = Record<string, KeywordData>
}
declare module 'highlight.js' {

	import { KeywordDict } from "highlight.js/private";

	export type HLJSApi = PublicApi & ModesAPI

	export interface VuePlugin {
		install: (vue: any) => void
	}

	// perhaps make this an interface?
	type RegexEitherOptions = {
		capture?: boolean
	}

	interface PublicApi {
		highlight: (codeOrLanguageName: string, optionsOrCode: string | HighlightOptions, ignoreIllegals?: boolean) => HighlightResult
		highlightAuto: (code: string, languageSubset?: string[]) => AutoHighlightResult
		highlightBlock: (element: HTMLElement) => void
		highlightElement: (element: HTMLElement) => void
		configure: (options: Partial<HLJSOptions>) => void
		initHighlighting: () => void
		initHighlightingOnLoad: () => void
		highlightAll: () => void
		registerLanguage: (languageName: string, language: LanguageFn) => void
		unregisterLanguage: (languageName: string) => void
		listLanguages: () => string[]
		registerAliases: (aliasList: string | string[], { languageName } : {languageName: string}) => void
		getLanguage: (languageName: string) => Language | undefined
		autoDetection: (languageName: string) => boolean
		inherit: <T>(original: T, ...args: Record<string, any>[]) => T
		addPlugin: (plugin: HLJSPlugin) => void
		debugMode: () => void
		safeMode: () => void
		versionString: string
		vuePlugin: () => VuePlugin
		regex: {
			concat: (...args: (RegExp | string)[]) => string,
			lookahead: (re: RegExp | string) => string,
			either: (...args: (RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]) => string,
			optional: (re: RegExp | string) => string,
			anyNumberOfTimes: (re: RegExp | string) => string
		}
	}

	interface ModesAPI {
		SHEBANG: (mode?: Partial<Mode> & {binary?: string | RegExp}) => Mode
		BACKSLASH_ESCAPE: Mode
		QUOTE_STRING_MODE: Mode
		APOS_STRING_MODE: Mode
		PHRASAL_WORDS_MODE: Mode
		COMMENT: (begin: string | RegExp, end: string | RegExp, modeOpts?: Mode | {}) => Mode
		C_LINE_COMMENT_MODE: Mode
		C_BLOCK_COMMENT_MODE: Mode
		HASH_COMMENT_MODE: Mode
		NUMBER_MODE: Mode
		C_NUMBER_MODE: Mode
		BINARY_NUMBER_MODE: Mode
		REGEXP_MODE: Mode
		TITLE_MODE: Mode
		UNDERSCORE_TITLE_MODE: Mode
		METHOD_GUARD: Mode
		END_SAME_AS_BEGIN: (mode: Mode) => Mode
		// built in regex
		IDENT_RE: string
		UNDERSCORE_IDENT_RE: string
		MATCH_NOTHING_RE: string
		NUMBER_RE: string
		C_NUMBER_RE: string
		BINARY_NUMBER_RE: string
		RE_STARTERS_RE: string
	}

	export type LanguageFn = (hljs: HLJSApi) => Language
	export type CompilerExt = (mode: Mode, parent: Mode | Language | null) => void

	export interface HighlightResult {
		code?: string
		relevance : number
		value : string
		language? : string
		illegal : boolean
		errorRaised? : Error
		// * for auto-highlight
		secondBest? : Omit<HighlightResult, 'second_best'>
		// private
		_illegalBy? : illegalData
		_emitter : Emitter
		_top? : Language | CompiledMode
	}
	export interface AutoHighlightResult extends HighlightResult {}

	export interface illegalData {
		message: string
		context: string
		index: number
		resultSoFar : string
		mode: CompiledMode
	}

	export type BeforeHighlightContext = {
		code: string,
		language: string,
		result?: HighlightResult
	}
	export type PluginEvent = keyof HLJSPlugin;
	export type HLJSPlugin = {
		'after:highlight'?: (result: HighlightResult) => void,
		'before:highlight'?: (context: BeforeHighlightContext) => void,
		'after:highlightElement'?: (data: { el: Element, result: HighlightResult, text: string}) => void,
		'before:highlightElement'?: (data: { el: Element, language: string}) => void,
		// TODO: Old API, remove with v12
		'after:highlightBlock'?: (data: { block: Element, result: HighlightResult, text: string}) => void,
		'before:highlightBlock'?: (data: { block: Element, language: string}) => void,
	}

	interface EmitterConstructor {
		new (opts: any): Emitter
	}

	export interface HighlightOptions {
		language: string
		ignoreIllegals?: boolean
	}

	export interface HLJSOptions {
		noHighlightRe: RegExp
		languageDetectRe: RegExp
		classPrefix: string
		cssSelector: string
		languages?: string[]
		__emitter: EmitterConstructor
		ignoreUnescapedHTML?: boolean
		throwUnescapedHTML?: boolean
	}

	export interface CallbackResponse {
		data: Record<string, any>
		ignoreMatch: () => void
		isMatchIgnored: boolean
	}

	export type ModeCallback = (match: RegExpMatchArray, response: CallbackResponse) => void
	export type Language = LanguageDetail & Partial<Mode>
	export interface Mode extends ModeCallbacks, ModeDetails {}

	export interface LanguageDetail {
		name?: string
		unicodeRegex?: boolean
		rawDefinition?: () => Language
		aliases?: string[]
		disableAutodetect?: boolean
		contains: (Mode)[]
		case_insensitive?: boolean
		keywords?: Record<string, any> | string
		isCompiled?: boolean,
		exports?: any,
		classNameAliases?: Record<string, string>
		compilerExtensions?: CompilerExt[]
		supersetOf?: string
	}

	// technically private, but exported for convenience as this has
	// been a pretty stable API and is quite useful
	export interface Emitter {
		addKeyword(text: string, kind: string): void
		addText(text: string): void
		toHTML(): string
		finalize(): void
		closeAllNodes(): void
		openNode(kind: string): void
		closeNode(): void
		addSublanguage(emitter: Emitter, subLanguageName: string): void
	}

	export type HighlightedHTMLElement = HTMLElement & {result?: object, secondBest?: object, parentNode: HTMLElement}

	/* modes */

	interface ModeCallbacks {
		"on:end"?: Function,
		"on:begin"?: ModeCallback
	}

	export interface CompiledLanguage extends LanguageDetail, CompiledMode {
		isCompiled: true
		contains: CompiledMode[]
		keywords: Record<string, any>
	}

	export type CompiledScope = Record<number, string> & {_emit?: Record<number, boolean>, _multi?: boolean, _wrap?: string};

	export type CompiledMode = Omit<Mode, 'contains'> &
		{
			begin?: RegExp | string
			end?: RegExp | string
			scope?: string
			contains: CompiledMode[]
			keywords: KeywordDict
			data: Record<string, any>
			terminatorEnd: string
			keywordPatternRe: RegExp
			beginRe: RegExp
			endRe: RegExp
			illegalRe: RegExp
			matcher: any
			isCompiled: true
			starts?: CompiledMode
			parent?: CompiledMode
			beginScope?: CompiledScope
			endScope?: CompiledScope
		}

	interface ModeDetails {
		begin?: RegExp | string | (RegExp | string)[]
		match?: RegExp | string | (RegExp | string)[]
		end?: RegExp | string | (RegExp | string)[]
		// deprecated in favor of `scope`
		className?: string
		scope?: string | Record<number, string>
		beginScope?: string | Record<number, string>
		endScope?: string | Record<number, string>
		contains?: ("self" | Mode)[]
		endsParent?: boolean
		endsWithParent?: boolean
		endSameAsBegin?: boolean
		skip?: boolean
		excludeBegin?: boolean
		excludeEnd?: boolean
		returnBegin?: boolean
		returnEnd?: boolean
		__beforeBegin?: Function
		parent?: Mode
		starts?:Mode
		lexemes?: string | RegExp
		keywords?: Record<string, any> | string
		beginKeywords?: string
		relevance?: number
		illegal?: string | RegExp | Array<string | RegExp>
		variants?: Mode[]
		cachedVariants?: Mode[]
		// parsed
		subLanguage?: string | string[]
		isCompiled?: boolean
		label?: string
	}

	const hljs : HLJSApi;
	export default hljs;
}

declare module 'highlight.js/lib/languages/*' {
	import { LanguageFn } from "highlight.js";
	const defineLanguage: LanguageFn;
	export default defineLanguage;
}