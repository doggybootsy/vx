import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import {getLazyStore} from "@webpack";
import {createSettings, SettingType} from "../settings";

const inj = new Injector();

const settings = createSettings("experiments", {
  defaultEnableDevTools: {
    type: SettingType.SWITCH,
    title: "DevTools",
    description: "Toggles Discord Built-in DevTools.",
    default: true
  }
});

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
    inj.after(await getLazyStore("UserStore"), "getCurrentUser", (that, args, user) => {
      if (!user) return;
      if (!settings.defaultEnableDevTools.get()) return;
      
      user.flags |= 1;
    });
  },
});
