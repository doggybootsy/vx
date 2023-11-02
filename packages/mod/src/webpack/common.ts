import { FluxStore } from "discord-types/stores";
import { FluxDispatcher as FluxDispatcherType } from "discord-types/other";
import { getProxyByKeys, getProxyByStrings } from "./filters"
import { getProxyStore } from "./stores";
import { getModuleIdBySource, getProxy } from "./util";
import { DispatchEvent } from "discord-types/other/FluxDispatcher";
import { Channel, User } from "discord-types/general";
import { proxyCache } from "../util";
import { webpackRequire } from "./webpack";

export const React = getProxyByKeys<typeof import("react")>([ "createElement", "memo" ]);
export const ReactDOM = getProxyByKeys<typeof import("react-dom")>([ "render", "hydrate", "createPortal" ]);
export const ReactSpring = getProxyByKeys<any>([ "config", "to", "a", "useSpring" ]);
export const UserStore = getProxyStore("UserStore");
export const ChannelStore = getProxyStore("ChannelStore");
export const SelectedChannelStore = getProxyStore("SelectedChannelStore");
export const GuildStore = getProxyStore("GuildStore");
export const SelectedGuildStore = getProxyStore("SelectedGuildStore");

export const Flux = getProxyByKeys<any>([ "useStateFromStores", "Dispatcher" ]);

type useStateFromStores = <T>(stores: FluxStore[], effect: () => T) => T;
export const useStateFromStores = proxyCache<useStateFromStores>(() => Flux.useStateFromStores);

export const FluxDispatcher = getProxyByKeys<FluxDispatcherType>([ "subscribe", "dispatch" ]);

interface NavigationUtil {
  transitionTo(path: string): void,

  // DM
  transtionToGuild(guildId: null, channelId: string, messageId?: string): void,
  // Guild
  transtionToGuild(guildId: string, channelId?: string, messageId?: string): void,
  // Guild Thread
  transtionToGuild(guildId: string | null, channelId: string, threadId: string, messageId?: string): void,

  replace(path: string): void,

  back(): void,
  forward(): void
};

export const NavigationUtils = getProxyByKeys<NavigationUtil>([ "back", "forward", "transitionTo" ]);

export function dirtyDispatch(event: DispatchEvent) {
  return new Promise<void>((resolve) => {
    FluxDispatcher.wait(() => {
      resolve(FluxDispatcher.dispatch(event));
    });
  });
};

interface i18n {
  Messages: Record<Capitalize<string>, string>,
  getLocale(): string
};
export const I18n = getProxy<i18n>(m => m.Messages && Array.isArray(m._events.locale));

export const insertText = proxyCache(() => {
  let ComponentDispatch: any;

  return (content: string) => {
    // ComponentDispatch can be easily called before its loaded so this will require it
    if (!ComponentDispatch) {
      const id = getModuleIdBySource("ComponentDispatcher:", "ComponentDispatch:")!;
      ComponentDispatch = webpackRequire!(id).ComponentDispatch;
    };

    ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
      plainText: content
    });
  };
});

export const LayerManager = {
  pushLayer(component: () => React.ReactNode) {
    dirtyDispatch({
      type: "LAYER_PUSH",
      component
    });
  },
  popLayer() {
    dirtyDispatch({
      type: "LAYER_POP"
    });
  },
  popAllLayers() {
    dirtyDispatch({
      type: "LAYER_POP_ALL"
    });
  }
};

const cachedUserFetches = new Map<string, Promise<User>>();
const fetchUserModule = getProxyByStrings<(uid: string) => Promise<User>>([ "USER_UPDATE", "getUser", "USER(" ], { searchExports: true });
export function fetchUser(userId: string): Promise<User> {
  if (cachedUserFetches.has(userId)) return cachedUserFetches.get(userId)!;

  const request = fetchUserModule(userId);
  request.catch(() => {
    // To attempt the fetch again later
    cachedUserFetches.delete(userId);
  });

  cachedUserFetches.set(userId, request);

  return request;
};

export const WindowUtil = getProxyByKeys<{
  handleClick(options: { href: string }, event?: React.MouseEvent): Promise<void>,
  isLinkTrusted(link: string): boolean
}>([ "isLinkTrusted" , "handleClick" ]);

const openUserContextMenuModule = getProxyByStrings<(event: React.MouseEvent, user: User, channel: Channel) => void>([ ".isGroupDM()?", ".isDM()?", "targetIsUser:", ",Promise.all(" ], { searchExports: true });
export const openUserContextMenu = (event: React.MouseEvent, user: User) => {
  const dummyChannel = {
    isGroupDM() { return false; },
    isDM() { return false; },
    guild_id: null
  } as unknown as Channel;
  
  openUserContextMenuModule(event, user, dummyChannel);
};