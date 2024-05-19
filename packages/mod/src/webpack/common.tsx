export { default as React } from "react";
export { default as moment } from "moment";
export { default as ReactDOM } from "react-dom/client";

import { FluxStore } from "discord-types/stores";
import { FluxDispatcher as FluxDispatcherType } from "discord-types/other";
import { getLazyByKeys, getProxyByKeys } from "./filters"
import { GenericStore, getProxyStore } from "./stores";
import { getModuleIdBySource, getProxy } from "./util";
import { DispatchEvent } from "discord-types/other/FluxDispatcher";
import { Channel, User } from "discord-types/general";
import { createNullObject, proxyCache } from "../util";
import { webpackRequire } from "@webpack";
import { ErrorBoundary } from "../components";

type ConfigKeys = "default" | "gentle" | "wobbly" | "stiff" | "slow" | "molasses";

interface ReactSpringType {
  useSpring: any,
  useSprings: any[],
  config: Record<ConfigKeys, {
    friction: number,
    tension: number
  }>,
  animated: {
    [key in keyof JSX.IntrinsicElements]: React.ComponentType<JSX.IntrinsicElements[key]>
  },
  a: this["animated"]
}

export const ReactSpring = getProxyByKeys<ReactSpringType>([ "config", "to", "a", "useSpring" ]);
export const UserStore = getProxyStore("UserStore");
export const ChannelStore = getProxyStore("ChannelStore");
export const SelectedChannelStore = getProxyStore("SelectedChannelStore");
export const GuildStore = getProxyStore("GuildStore");
export const SelectedGuildStore = getProxyStore("SelectedGuildStore");
export const PermissionStore = getProxyStore("PermissionStore");
export const MessageStore = getProxyStore("MessageStore");
export const GuildMemberStore = getProxyStore("GuildMemberStore");

export interface Store {
  new (dispatcher: FluxDispatcherType, handlers: Record<string, Function>, somethingIDK?: unknown): GenericStore,
  getAll(): GenericStore[],
  prototype: GenericStore
}

type useStateFromStores = <T>(stores: FluxStore[], effect: () => T, deps?: React.DependencyList) => T;
export const Flux = getProxyByKeys<{
  useStateFromStores: useStateFromStores,
  Store: Store
}>([ "useStateFromStores", "Dispatcher" ]);

export const useStateFromStores = proxyCache(() => Flux.useStateFromStores);

export const FluxDispatcher = getProxyByKeys<FluxDispatcherType>([ "subscribe", "dispatch" ]);

interface NavigationUtil {
  transitionTo(path: string): void,

  // DM
  transitionToGuild(guildId: null, channelId: string, messageId?: string): void,
  // Guild
  transitionToGuild(guildId: string, channelId?: string, messageId?: string): void,
  // Guild Thread
  transitionToGuild(guildId: string | null, channelId: string, threadId: string, messageId?: string): void,

  replace(path: string): void,

  back(): void,
  forward(): void
};

export const NavigationUtils = getProxyByKeys<NavigationUtil>([ "back", "forward", "transitionTo" ]);

export function dirtyDispatch(event: DispatchEvent): Promise<void> {
  return new Promise((resolve) => {
    FluxDispatcher.wait(() => {
      resolve(FluxDispatcher.dispatch(event));
    });
  });
}

const FluxDispatcherPromise = getLazyByKeys([ "subscribe", "dispatch" ]);
export function subscribeToDispatch<T extends DispatchEvent = DispatchEvent>(eventName: string, listener: (event: T) => void) {
  const controller = new AbortController();

  FluxDispatcherPromise.then(() => {
    if (controller.signal.aborted) return;
    
    FluxDispatcher.subscribe(eventName, listener);

    controller.signal.addEventListener("abort", () => {
      FluxDispatcher.unsubscribe(eventName, listener);
    });
  });

  return () => controller.abort();
}

export type LocaleCodes = "en-US" | "en-GB" | "zh-CN" | "zh-TW" | "cs" | "da" | "nl" | "fr" | "de" | "el" | "hu" | "it" | "ja" | "ko" | "pl" | "pt-PT" | "pt-BR" | "ru" | "sk" | "es-ES" | "es-419" | "sv-SE" | "tr" | "bg" | "uk" | "fi" | "no" | "hr" | "ro" | "lt" | "th" | "vi" | "hi" | "he" | "ar" | "id";

interface i18n {
  Messages: Record<Uppercase<string>, string>,
  getLocale(): LocaleCodes,
  on(event: "locale", callback: (newLocale: LocaleCodes, oldLocale: LocaleCodes) => void): void,
  off(event: string, callback: Function): void,
  loadPromise: Promise<void>
};
export const I18n = getProxy<i18n>(m => m.Messages && Array.isArray(m._events.locale));

export const ComponentDispatch = proxyCache(() => {
  const id = getModuleIdBySource("ComponentDispatcher:", "ComponentDispatch:")!;
  return webpackRequire!(id).ComponentDispatch;
});

const userUploadActions = getProxyByKeys([ "promptToUpload" ]);
const DraftStore = getProxyStore("DraftStore");
const UploadAttachmentStore = getProxyStore("UploadAttachmentStore");

export const TextAreaInput = createNullObject({
  clearText() {
    ComponentDispatch.dispatchToLastSubscribed("CLEAR_TEXT");
  },
  insert(text: string, files: Iterable<File> = []) {
    TextAreaInput.insertText(text);
    TextAreaInput.insertFiles(...files);
  },
  insertText(text: string) {
    ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
      rawText: text,
      plainText: text
    });
  },
  insertFiles(...files: File[]) {
    const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());

    userUploadActions.promptToUpload(files, channel, 0);
  },
  
  focus() {
    ComponentDispatch.dispatchToLastSubscribed("TEXTAREA_FOCUS");
  },
  blur() {
    ComponentDispatch.dispatchToLastSubscribed("TEXTAREA_BLUR");
  },

  getText(): string {
    return DraftStore.getDraft(SelectedChannelStore.getChannelId(), 0);
  },
  getFiles(): File[] {
    return UploadAttachmentStore.getUploads(SelectedChannelStore.getChannelId(), 0).map((cloud: any) => cloud.item.file);
  },
  get() {
    return {
      text: TextAreaInput.getText(),
      files: TextAreaInput.getFiles()
    }
  }
}, "TextAreaInput");

function FallbackView() {
  return <ErrorBoundary.FallbackView closeAction={LayerManager.pop} />
}

export const LayerManager = createNullObject({
  push(component: React.ComponentType, fallback: React.ComponentType = FallbackView) {
    dirtyDispatch({
      type: "LAYER_PUSH",
      component: ErrorBoundary.wrap(component, fallback)
    });
  },
  pop() {
    dirtyDispatch({ type: "LAYER_POP" });
  },
  clear() {
    dirtyDispatch({ type: "LAYER_POP_ALL" });
  }
}, "LayerManager");

const cachedUserFetches = new Map<string, Promise<User>>();
const fetchUserModule = getProxyByKeys<{
  getUser: (userId: string) => Promise<User>
}>([ "fetchCurrentUser", "getUser" ]);

export function fetchUser(userId: string): Promise<User> {
  if (cachedUserFetches.has(userId)) return cachedUserFetches.get(userId)!;

  const request = fetchUserModule.getUser(userId);
  request.catch(() => {
    // To attempt the fetch again later
    cachedUserFetches.delete(userId);
  });

  cachedUserFetches.set(userId, request);

  return request;
}

export const ExternalWindow = getProxyByKeys<{
  handleClick(options: { href: string, trusted?: boolean, shouldConfirm?: boolean, onConfirm?(): void }, event?: React.MouseEvent, analyticsLocations?: string): Promise<void>,
  isLinkTrusted(link: string): boolean
}>([ "isLinkTrusted" , "handleClick" ]);

const openMenuModule = getProxyByKeys<{
  openUserContextMenu(event: React.MouseEvent, user: User, channel: Channel): void
}>([ "openUserContextMenu", "openModerateUserContextMenu" ]);
export function openUserContextMenu(event: React.MouseEvent, user: User | string, useCurrentChannel: boolean = false) {
  if (typeof user === "string") user = UserStore.getUser(user);
  
  const dummyChannel = {
    isGroupDM() { return false; },
    isDM() { return false; },
    guild_id: null
  } as unknown as Channel;
  const currentChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());

  const channel = !useCurrentChannel ? dummyChannel : currentChannel || dummyChannel;

  openMenuModule.openUserContextMenu(event, user, channel);
}

interface KnownPermssionBits {
  CREATE_INSTANT_INVITE: 1n,
  KICK_MEMBERS: 2n,
  BAN_MEMBERS: 4n,
  ADMINISTRATOR: 8n,
  MANAGE_CHANNELS: 16n,
  MANAGE_GUILD: 32n,
  CHANGE_NICKNAME: 67108864n,
  MANAGE_NICKNAMES: 134217728n,
  MANAGE_ROLES: 268435456n,
  MANAGE_WEBHOOKS: 536870912n,
  MANAGE_GUILD_EXPRESSIONS: 1073741824n,
  CREATE_GUILD_EXPRESSIONS: 8796093022208n,
  VIEW_AUDIT_LOG: 128n,
  VIEW_CHANNEL: 1024n,
  VIEW_GUILD_ANALYTICS: 524288n,
  VIEW_CREATOR_MONETIZATION_ANALYTICS: 2199023255552n,
  MODERATE_MEMBERS: 1099511627776n,
  USE_EMBEDDED_ACTIVITIES: 549755813888n,
  SEND_MESSAGES: 2048n,
  SEND_TTS_MESSAGES: 4096n,
  MANAGE_MESSAGES: 8192n,
  EMBED_LINKS: 16384n,
  ATTACH_FILES: 32768n,
  READ_MESSAGE_HISTORY: 65536n,
  MENTION_EVERYONE: 131072n,
  USE_EXTERNAL_EMOJIS: 262144n,
  ADD_REACTIONS: 64n,
  USE_APPLICATION_COMMANDS: 2147483648n,
  MANAGE_THREADS: 17179869184n,
  CREATE_PUBLIC_THREADS: 34359738368n,
  CREATE_PRIVATE_THREADS: 68719476736n,
  USE_EXTERNAL_STICKERS: 137438953472n,
  SEND_MESSAGES_IN_THREADS: 274877906944n,
  SEND_VOICE_MESSAGES: 70368744177664n,
  USE_CLYDE_AI: 140737488355328n,
  CONNECT: 1048576n,
  SPEAK: 2097152n,
  MUTE_MEMBERS: 4194304n,
  DEAFEN_MEMBERS: 8388608n,
  MOVE_MEMBERS: 16777216n,
  USE_VAD: 33554432n,
  PRIORITY_SPEAKER: 256n,
  STREAM: 512n,
  USE_SOUNDBOARD: 4398046511104n,
  USE_EXTERNAL_SOUNDS: 35184372088832n,
  SET_VOICE_CHANNEL_STATUS: 281474976710656n,
  REQUEST_TO_SPEAK: 4294967296n,
  MANAGE_EVENTS: 8589934592n,
  CREATE_EVENTS: 17592186044416n
};

interface Constants {
  Permissions: KnownPermssionBits & Record<string, bigint>
};

export const Constants = getProxyByKeys<Omit<Record<string, any>, keyof Constants> & Constants>([ "Accessibility", "AVATAR_SIZE", "Permissions" ]);

interface Invite {
  approximate_member_count: number,
  approximate_presence_count: number,
  channel: { id: string, type: number, name: string },
  code: string,
  expires_at: string | null,
  flags: number,
  guild: {
    banner: string | null,
    description: string | null,
    features: string[],
    icon: string | null,
    id: string,
    name: string,
    nsfw: boolean,
    nsfw_level: number,
    premium_subscription_count: number,
    splash: string | null,
    vanity_url_code: string | null,
    verification_level: number
  }
};

export const InviteActions = getProxyByKeys<{
  resolveInvite: (code: string, analytics?: string) => Promise<{ code: string, invite?: Invite }>
}>([ "resolveInvite", "createInvite" ]);

export const MessageActions = getProxyByKeys([ "sendMessage", "_sendMessage" ]);

export function sendMessage(message?: string, channelId: string = SelectedChannelStore.getChannelId()) {
  if (!arguments.length) {
    message = TextAreaInput.getText();
    TextAreaInput.clearText();
  }

  return new Promise<boolean>(async (resolve) => {
    const { ok } = await MessageActions.sendMessage(channelId, {
      content: message!,
      invalidEmojis: [],
      tts: false,
      validNonShortcutEmojis: []
    });

    resolve(ok);
  });
}