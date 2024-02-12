import { User, Guild, Channel } from "discord-types/general";
import { ChannelStore, FluxStore, GuildMemberStore, MessageStore, RelationshipStore, SelectedChannelStore, SelectedGuildStore, GuildStore, UserStore } from "discord-types/stores";
import { proxyCache } from "../util";
import { getByKeys } from "./filters";
import { Store } from "./common";

export type GenericStore = FluxStore & Record<string, any>;

interface PermissionStore extends GenericStore {
  canManageUser(permission: bigint, user: User, guild: Guild): boolean
};
interface PopoutWindowStore extends GenericStore {
  getWindow(id: string): Window & typeof globalThis | void,
  getWindowOpen(id: string): boolean,
  unmountWindow(id: string): void
};
interface ThemeStore extends GenericStore {
  theme: "light" | "dark",
  darkSidebar: boolean,
  isSystemThemeAvailable: boolean,
  systemPrefersColorScheme: "light" | "dark",
  systemTheme: null | "light" | "dark",
  getState(): { theme: "light" | "dark" }
};

interface CorrectRelationshipStore extends RelationshipStore {
  getSince(userId: string): string | void
};

interface CorrectChannelStore extends ChannelStore {
  getChannelIds(): string[],
  getChannelIds(guildId: string): string[],
  getMutableGuildChannelsForGuild(guildId: string): Record<string, Channel>,
  getMutablePrivateChannels(): Record<string, Channel>
};

interface KnownStores {
  UserStore: UserStore,
  ChannelStore: CorrectChannelStore,
  SelectedChannelStore: SelectedChannelStore,
  GuildMemberStore: GuildMemberStore,
  MessageStore: MessageStore,
  RelationshipStore: CorrectRelationshipStore,
  SelectedGuildStore: SelectedGuildStore,
  GuildStore: GuildStore,
  PermissionStore: PermissionStore,
  PopoutWindowStore: PopoutWindowStore,
  ThemeStore: ThemeStore
};

type StorePredicate = (store: GenericStore) => any;

let Store: Store | void;
export function getStore<S extends keyof KnownStores>(store: S): KnownStores[S]
export function getStore<S extends keyof KnownStores>(store: S | string | StorePredicate): GenericStore
export function getStore(store: string | StorePredicate): GenericStore | void  {
  if (!Store) Store = getByKeys<Store>([ "getAll", "destroy", "initialize" ]);
  if (!Store) return;

  const predicate: StorePredicate = typeof store === "string" ? (str) => str.getName() === store : store;

  return Store.getAll().find(predicate);
}

export function getProxyStore<S extends keyof KnownStores>(store: S): KnownStores[S]
export function getProxyStore<S extends keyof KnownStores>(store: S | string | StorePredicate): GenericStore
export function getProxyStore(store: string | StorePredicate): GenericStore {
  const predicate: StorePredicate = typeof store === "string" ? (str) => str.getName() === store : store;

  return proxyCache(() => getStore(predicate)!);
}

const listeners = new Set<[  StorePredicate, (store: GenericStore) => void ]>();
export function _lazyStore(store: GenericStore) {
  for (const [ predicate, resolve ] of listeners) {
    if (predicate(store)) resolve(store);
  }
}

export function getLazyStore<S extends keyof KnownStores>(store: S, options?: Webpack.SignalOption): Promise<KnownStores[S]>
export function getLazyStore<S extends keyof KnownStores>(store: S | string | StorePredicate, options?: Webpack.SignalOption): Promise<GenericStore>
export function getLazyStore(store: string | StorePredicate, options?: Webpack.SignalOption): Promise<GenericStore> {
  const predicate: StorePredicate = typeof store === "string" ? (str) => str.getName() === store : store;
  
  const cache = getStore(predicate);
  if (cache) return Promise.resolve(cache);

  return new Promise((resolve, reject) => {
    const data = [ predicate, resolve ] as [ StorePredicate, (store: GenericStore) => void ];

    listeners.add(data);

    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        reject(new Error("User aborted lazy module search"));
        listeners.delete(data);
      })
    }
  });
}
