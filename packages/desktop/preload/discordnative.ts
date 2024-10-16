import electron, { ContextBridge } from "electron";
import { replaceNodeModuleExports } from "common/node";

const contextBridge: ContextBridge = {
  ...electron.contextBridge,
  exposeInMainWorld(apiKey, api): void {
    if (apiKey === "DiscordNative") {
      const DiscordNative: NonNullable<typeof window.DiscordNative> = api;

      // On macOS check if native frame is enabled
      // every other os say false
      DiscordNative.window.USE_OSX_NATIVE_TRAFFIC_LIGHTS = (
        process.platform === "darwin" && window.VXNative!.nativeFrame.get()
      );
    }

    electron.contextBridge.exposeInMainWorld(apiKey, api);
  }
};

replaceNodeModuleExports("electron", { ...electron, contextBridge });