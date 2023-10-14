import { FluxStore } from "discord-types/stores";
import { FluxDispatcher as FluxDispatcherType } from "discord-types/other";
import { byStrings, getProxyByKeys, getProxyByStrings } from "./filters"
import { getProxyStore } from "./stores";
import { InternalStore, useSignal } from "../util";
import { getMangledProxy, getProxy } from "./util";
import { getModule } from "./searching";
import { DispatchEvent } from "discord-types/other/FluxDispatcher";
import { User } from "discord-types/general";

export const React = getProxyByKeys<typeof import("react")>([ "createElement", "memo" ]);
export const ReactDOM = getProxyByKeys<typeof import("react-dom")>([ "render", "hydrate", "hydrateRoot" ]);
export const ReactSpring = getProxyByKeys<any>([ "config", "to", "a", "useSpring" ]);
export const UserStore = getProxyStore("UserStore");
export const GuildStore = getProxyStore("GuildStore");

type useStateFromStores = <T>(stores: Array<FluxStore | InternalStore>, effect: () => T) => T;
export const useStateFromStores = getProxyByStrings<useStateFromStores>([ "useStateFromStores" ]);

export const FluxDispatcher = getProxyByKeys<FluxDispatcherType>([ "subscribe", "dispatch" ]);

interface NavigationUtil {
  transitionTo(path: string): void,

  // DM
  transtionToGuild(guildId: null, channelId: SNOWFLAKE, messageId?: SNOWFLAKE): void,
  // Guild
  transtionToGuild(guildId: SNOWFLAKE, channelId?: SNOWFLAKE, messageId?: SNOWFLAKE): void,
  // Guild Thread
  transtionToGuild(guildId: SNOWFLAKE | null, channelId: SNOWFLAKE, threadId: SNOWFLAKE, messageId?: SNOWFLAKE): void,

  replace(path: string): void,

  goBack(): void,
  goForward(): void
};

export const NavigationUtils = getMangledProxy<NavigationUtil>("transitionTo - Transitioning to", {
  transitionTo: byStrings("\"transitionTo - Transitioning to \""),
  replace: byStrings("\"Replacing route with \""),
  goBack: byStrings(".goBack()"),
  goForward: byStrings(".goForward()"),
  transtionToGuild: byStrings("\"transitionToGuild - Transitioning to \"")
});

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

export const insertText = (() => {
  let ComponentDispatch: any;
  
  return (content: string) => {
    if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter?.listeners?.('INSERT_TEXT')?.length, { searchExports: true });
    
    ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
      plainText: content
    });
  };
})();

export const LayerManager = {
  pushLayer(component: () => React.ReactNode) {
    FluxDispatcher.dispatch({
      type: "LAYER_PUSH",
      component
    });
  },
  popLayer() {
    // Using dirty dispatch even tho discord doesn't because cloning ContextMenus.close()
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

export function useUser(userId: string): User | null {
  const [ user, setUser ] = React.useState(() => UserStore.getUser(userId) || null);
  const [ signal, abort ] = useSignal();

  React.useLayoutEffect(() => {
    if (!user) return;

    fetchUser(userId).then((user) => {
      if (signal.aborted) return;

      setUser(user);
    });

    return () => abort();
  }, [ ]);
  
  return user;
};

export const WindowUtil = getMangledProxy<{
  open: (opts: { href: string }) => void,
  isTrusted: (url: string, idk: unknown) => boolean
}>(".Messages.MALFORMED_LINK_BODY", {
  open: byStrings(".apply"),
  isTrusted: byStrings(".getChannelId()")
});