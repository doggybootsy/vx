import electron, { ContextBridge } from "electron";
import { replaceNodeModuleExports } from "common/node";

const contextBridge: ContextBridge = {
  ...electron.contextBridge,
  exposeInMainWorld(apiKey, api): void {
    if (apiKey === "DiscordNative") {
      const DiscordNative: NonNullable<typeof window.DiscordNative> = api;

      // Make it where osx has old titlebar
      DiscordNative.window.USE_OSX_NATIVE_TRAFFIC_LIGHTS = true;
    };

    electron.contextBridge.exposeInMainWorld(apiKey, api);
  }
};

replaceNodeModuleExports("electron", { ...electron, contextBridge });