import filters from "renderer/webpack/filters";
import { getLazy } from "renderer/webpack/lazy";
import { Dispatcher, MessageActions, NavigationUtil, commonModules, i18n, react, reactDOM } from "renderer/webpack/types";
import { PluginModule } from "renderer/addons/plugins/types";

const modules: commonModules = {
  React: null,
  ReactDOM: null,
  dispatcher: null,
  components: null,
  i18n: null,
  messageActions: null,
  navigation: null
};

let resolve: () => void;
const readyPromise = new Promise<void>((r) => resolve = r);

export function whenReady<type>(then: () => type): Promise<type>
export function whenReady(module: PluginModule): Promise<boolean>
export function whenReady(then?: void): Promise<void>
export async function whenReady(then?: void | PluginModule | (() => any)): Promise<any> {
  await readyPromise;

  if (then instanceof Function) return then();
  if (typeof then === "object") return then.enabled;
};

getLazy<react>((m) => m.memo && m.createElement).then((react) => modules.React = react);
getLazy<Dispatcher>((module) => module.subscribe && module.dispatch).then((dispatcher) => {
  modules.dispatcher = dispatcher;

  function listener() {      
    resolve();
    dispatcher.unsubscribe("CONNECTION_OPEN", listener);
  };

  dispatcher.subscribe("CONNECTION_OPEN", listener);
});
getLazy<Record<string, any>>((module) => module.Avatar && module.Button).then((components) => modules.components = components);
getLazy<i18n>((module) => module.Messages && Array.isArray(module._events.locale)).then((i18n) => modules.i18n = i18n);
getLazy<MessageActions>((module) => module.sendMessage && module.sendBotMessage).then((messageActions) => modules.messageActions = messageActions);

getLazy<reactDOM>((module) => module.render && module.createPortal).then((ReactDOM) => modules.ReactDOM = ReactDOM);

const navigationFilters = {
  transitionTo: filters.byStrings("\"transitionTo - Transitioning to \""),
  replace: filters.byStrings("\"Replacing route with \""),
  goBack: filters.byStrings(".goBack()"),
  goForward: filters.byStrings(".goForward()"),
  transtionToGuild: filters.byStrings("\"transitionToGuild - Transitioning to \"")
};
getLazy<Record<string, Function>>((module) => {
  const values = Object.values(module);

  return values.length && values.some((value) => {
    for (const key in navigationFilters)
      if (navigationFilters[key](value)) return true;
  });
}).then((navigation) => {
  const navModule = { };

  for (const key in navigation) {
    const item = navigation[key];

    for (const filterKey in navigationFilters) {
      const filter = navigationFilters[filterKey];
      if (navModule[filterKey]) continue;

      if (filter(item)) navModule[filterKey] = item;
    };
  };

  modules.navigation = navModule as NavigationUtil;
});

export default modules;