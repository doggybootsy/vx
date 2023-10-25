import electron, { ContextBridge } from "electron";
import { replaceNodeModuleExports } from "common/node";

const contextBridge: ContextBridge = {
  ...electron.contextBridge,
  exposeInMainWorld(apiKey, api): void {
    if (apiKey === "DiscordNative") {
      const DiscordNative: NonNullable<typeof window.DiscordNative> = api;

      // Make it where osx has old titlebar
      // and make it where devtools callbacks doesn't 'exist'
      DiscordNative.window.USE_OSX_NATIVE_TRAFFIC_LIGHTS = true;
      DiscordNative.window.setDevtoolsCallbacks(() => {}, () => {});
      DiscordNative.window.setDevtoolsCallbacks = () => {};
    };

    electron.contextBridge.exposeInMainWorld(apiKey, api);
  }
};

replaceNodeModuleExports("electron", { ...electron, contextBridge });