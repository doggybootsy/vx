export interface WebpackRequire {
  (id: number | string): any,
  c: Record<number | string, module>,
  m: Record<number | string, chunkModule>,
  d(obj1: any, obj2: any): void
}

export type module = {
  exports: any,
  id: number | string
};
export type chunkModule = (module: module, exports: any, require: WebpackRequire) => void;
export type chunkObj = [
  (Symbol | string | number)[],
  Record<string | number, chunkModule>,
  (require: WebpackRequire) => any
];

export type moduleFilter = (exported: any, module: module, id: number | string) => boolean | any;
export type filterOptions = {
  searchExports?: boolean,
  searchDefault?: boolean
};

export type react = typeof import("react");
export type reactDOM = typeof import("react-dom/client");

export interface commonModules {
  React: react | null,
  ReactDOM: reactDOM | null,
  dispatcher: Dispatcher | null,
  components: Record<string, any> | null
  i18n: i18n | null,
  messageActions: MessageActions | null,
  navigation: NavigationUtil | null
};

export interface NavigationUtil {
  transitionTo(path: string): void,

  transtionToGuild(guildId: string, channelId?: string, messageId?: string): void
  transtionToGuild(guildId: void, channelId: string, messageId?: string): void,

  replace(path: string): void

  goBack(): void,
  goForward(): void
};

export interface MessageActions {
  sendBotMessage(channelId: string, content: string): void
};

type dispatcherCallback = (event: { type: string, [key: string]: any }) => void;
export interface Dispatcher {
  dispatch(event: { type: string, [key: string]: any }): Promise<void>;
  subscribe(event: string, callback: dispatcherCallback): void;
  unsubscribe(event: string, callback: dispatcherCallback): void;
};

export interface i18n {
  Messages: Record<Capitalize<string>, string>,
  getLocale(): string
};

export interface Store {  
  getDispatchToken(): string,
  getName(): string,

  initialize(): void,
  initializeIfNeeded(): void,
  
  registerActionHandlers(actions: Record<string, (data: any) => void>, t: unknown): unknown,
  
  syncWith(store: Store, callback: () => boolean, timeout: number): void,
  waitFor(...stores: Store[]): unknown;
  
  emitChange(): void,
  addChangeListener(callback: () => void): void;
  removeChangeListener(callback: () => void): void;
  addReactChangeListener(callback: () => void): void;
  removeReactChangeListener(callback: () => void): void;
  
  __getLocalVars?(): any;

  [key: string | number | symbol]: any;
};

export type CSSClasses<classNames extends string = string> = Record<classNames, string>;