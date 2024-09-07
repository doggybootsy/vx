import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import {getProxyStore, getStore, whenWebpackReady} from "@webpack";
import { User } from "discord-types/general";
import {DataStore} from "../../api/storage";
import {createSettings, SettingType} from "../settings";

const PLUGIN_NAME = "experiments"
const inj = new Injector();
const UserStore = getProxyStore("UserStore")

// why did you make me put in experiments ughhglhkjnfglhkfghfgghfghlfgjlgfh
const storage = new DataStore<{ defaultEnableDevTools: boolean }>(PLUGIN_NAME);

const settings = createSettings(PLUGIN_NAME, {
  defaultEnableDevTools: {
    type: SettingType.SWITCH,
    title: "DevTools",
    description: "Toggles Discord Built-in DevTools.",
    default: true
  }
})

export default definePlugin({
  authors: [Developers.doggybootsy],
  settings: settings,
  patches: [
    {
      match: "DeveloperExperimentStore",
      find: /(isDeveloper:{configurable:!1,get:function\(\){return ).{1,3}?}/,
      replace: "$1true}",
    },
    {
      // From replugged | idk how it works but it does
      match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
      find: /window\.GLOBAL_ENV\.RELEASE_CHANNEL/g,
      replace: "'staging'",
    },
  ],
  async start() {
    await whenWebpackReady();

    inj.after(UserStore, "getCurrentUser", (_, __, ___) => {
      const devToolsEnabled = storage.get("defaultEnableDevTools") ?? true;
      devToolsEnabled && ___ && ___.flags !== 1 ? ___.flags |= 1 : () => {return;}
    });
  },
});
