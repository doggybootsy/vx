import { User, Guild, Channel, Role, Message } from "discord-types/general";
import { ChannelStore, FluxStore, GuildMemberStore, MessageStore, RelationshipStore, SelectedChannelStore, SelectedGuildStore, GuildStore, UserStore } from "discord-types/stores";
import { proxyCache } from "../util";
import { getByKeys } from "./filters";
import { Store } from "./common";
import { logger } from "vx:logger";

export type GenericStore = FluxStore & Record<string, any>;

interface PermissionStore extends GenericStore {
  canManageUser(permission: bigint, user: User, guild: Guild): boolean
};
export interface PopoutWindowStore extends GenericStore {
  getWindow(id: string): (Window & typeof globalThis) | void,
  getWindowOpen(id: string): boolean,
  unmountWindow(id: string): void,
  getWindowKeys(): string[]
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

interface CorrectGuildStore extends GuildStore {
  getRoles(guildId: string): Record<string, Role>;
  getRole(guildId: string, roleId: string): Role;
}

interface CorrectMessageStore extends MessageStore {
  getLastMessage(channelId: string): Message | undefined
}

interface KnownStores {
  UserStore: UserStore,
  ChannelStore: CorrectChannelStore,
  SelectedChannelStore: SelectedChannelStore,
  GuildMemberStore: GuildMemberStore,
  MessageStore: CorrectMessageStore,
  RelationshipStore: CorrectRelationshipStore,
  SelectedGuildStore: SelectedGuildStore,
  GuildStore: CorrectGuildStore,
  PermissionStore: PermissionStore,
  PopoutWindowStore: PopoutWindowStore,
  ThemeStore: ThemeStore
};

type StorePredicate = (store: GenericStore) => any;
let Store: Store | void;

function makeStorePredicate(filter: string | StorePredicate): StorePredicate {
  let hasErrored = false;

  const original = filter as string;
  if (typeof filter === "string") filter = (store) => {
    const displayName = (store.constructor as { displayName?: string }).displayName;
    return original === (displayName || store.constructor.name);
  };

  return (store) => {
    try {
      return (filter as StorePredicate)(store);
    } 
    catch (error) {
      if (hasErrored) return false;
      hasErrored = true;
      logger.createChild("Webpack").warn("Webpack Module Search Error", { filter, module: store, error });
      return false
    }
  }
}

export function getStore<S extends keyof KnownStores>(filter: S): KnownStores[S]
export function getStore<T extends object>(store: string | StorePredicate): GenericStore & T
export function getStore(filter: string | StorePredicate): GenericStore | void  {
  if (!Store) Store = getByKeys<Store>([ "getAll", "destroy", "initialize" ]);
  if (!Store) return;
  
  return Store.getAll().find(makeStorePredicate(filter));
}

export function getProxyStore<S extends keyof KnownStores>(store: S): KnownStores[S]
export function getProxyStore<T extends object>(store: string | StorePredicate): GenericStore & T
export function getProxyStore(store: string | StorePredicate): GenericStore {
  return proxyCache(() => getStore(store)!);
}

const listeners = new Set<[  StorePredicate, (store: GenericStore) => void ]>();
export function _lazyStore(store: GenericStore) {
  for (const [ predicate, resolve ] of listeners) {
    if (predicate(store)) resolve(store);
  }
}

export function getLazyStore<S extends keyof KnownStores>(filter: S, options?: Webpack.SignalOption): Promise<KnownStores[S]>
export function getLazyStore<T extends object>(store: string | StorePredicate, options?: Webpack.SignalOption): Promise<GenericStore & T>
export function getLazyStore(filter: string | StorePredicate, options?: Webpack.SignalOption): Promise<GenericStore> {  
  const cache = getStore(filter);
  if (cache) return Promise.resolve(cache);

  return new Promise((resolve, reject) => {
    const data = [ makeStorePredicate(filter), resolve ] as [ StorePredicate, (store: GenericStore) => void ];

    listeners.add(data);

    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        reject(new Error("User aborted lazy module search"));
        listeners.delete(data);
      })
    }
  });
}
