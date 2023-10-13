import electron, { ContextBridge } from "electron";
import { replaceNodeModuleExports } from "common/node";

const contextBridge: ContextBridge = {
  ...electron.contextBridge,
  exposeInMainWorld(apiKey, api) {
    if (apiKey === "DiscordNative") {
      // Make it where osx has old titlebar
      // and make it where devtools callbacks doesn't 'exist'
      api.window.USE_OSX_NATIVE_TRAFFIC_LIGHTS = true;
      api.window.setDevtoolsCallbacks(() => {}, () => {});
      api.window.setDevtoolsCallbacks = () => {};
    };

    electron.contextBridge.exposeInMainWorld(apiKey, api);
  }
};

replaceNodeModuleExports("electron", { ...electron, contextBridge });