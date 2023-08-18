import electron from "electron";

const ELECTRON_PATH = require.resolve("electron");
const electronCache = require.cache[ELECTRON_PATH];
if (electronCache) {
  delete electronCache.exports;
  electronCache.exports = {
    ...electron, 
    contextBridge: {
      ...electron.contextBridge,
      exposeInMainWorld(apiKey: string, api: any) {
        if (apiKey === "DiscordNative") {
          api.window.USE_OSX_NATIVE_TRAFFIC_LIGHTS = true;
          api.window.setDevtoolsCallbacks(() => {}, () => {});
          api.window.setDevtoolsCallbacks = () => {};
        };

        electron.contextBridge.exposeInMainWorld(apiKey, api);
      }
    }
  };
};