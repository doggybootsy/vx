import { User, Guild, Channel } from "discord-types/general";
import { ChannelStore, FluxStore, GuildMemberStore, MessageStore, RelationshipStore, SelectedChannelStore, SelectedGuildStore, GuildStore, UserStore } from "discord-types/stores";
import { proxyCache } from "../util";
import { getByKeys } from "./filters";

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

let Store: { getAll(): GenericStore[] } | void;
export function getStore<S extends keyof KnownStores>(store: S): KnownStores[S]
export function getStore<S extends keyof KnownStores>(store: S | string): GenericStore
export function getStore(store: string): GenericStore | void  {
  if (!Store) Store = getByKeys<{ getAll(): GenericStore[] }>([ "getAll", "destroy", "initialize" ]);
  if (!Store) return;

  return Store.getAll().find((str) => str.getName() === store);
};
export function getProxyStore<S extends keyof KnownStores>(store: S): KnownStores[S]
export function getProxyStore<S extends keyof KnownStores>(store: S | string): GenericStore
export function getProxyStore(store: string): GenericStore {
  return proxyCache(() => getStore(store)!);
};
