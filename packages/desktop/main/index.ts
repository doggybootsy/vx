import electron from "electron";

import { replaceNodeModuleExports } from "common/node";
import { BrowserWindow } from "./window";
import { loadExtensions } from "./extensions";

import "./ipc";
import "./request";
import "./colors";
import "./spotify";
import "./addons";
import { env } from "vx:self";

console.log(`Welcome to VX v${env.VERSION}`);

replaceNodeModuleExports("electron", { ...electron, BrowserWindow });

try {
  const descriptor = Object.getOwnPropertyDescriptor(global, "appSettings");
  Object.defineProperty(global, "appSettings", {
    get: () => descriptor?.get?.() || descriptor?.value,
    set(v) {
      v.set("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", true);
      
      descriptor?.set?.(v);
      delete (global as any).appSettings;
      (global as any).appSettings = v;
    },
    configurable: true,
    enumerable: true
  });
} catch (error) {
  
}

electron.app.whenReady().then(loadExtensions);
