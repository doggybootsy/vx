import { User, Guild } from "discord-types/general";
import { ChannelStore, FluxStore, GuildMemberStore, MessageStore, RelationshipStore, SelectedChannelStore, SelectedGuildStore, GuildStore, UserStore } from "discord-types/stores";
import { proxyCache } from "../util";
import { getByKeys } from "./filters";

interface PermissionStore extends FluxStore {
  canManageUser(permission: bigint, user: User, guild: Guild): boolean
};
interface PopoutWindowStore extends FluxStore {
  getWindow(id: string): Window | void,
  unmountWindow(id: string): void
};

interface KnownStores {
  UserStore: UserStore,
  ChannelStore: ChannelStore,
  SelectedChannelStore: SelectedChannelStore,
  GuildMemberStore: GuildMemberStore,
  MessageStore: MessageStore,
  RelationshipStore: RelationshipStore,
  SelectedGuildStore: SelectedGuildStore,
  GuildStore: GuildStore,
  PermissionStore: PermissionStore,
  PopoutWindowStore: PopoutWindowStore
};

export type GenericStore = FluxStore & Record<string, any>;

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
