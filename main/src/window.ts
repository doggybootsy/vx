import electron, { BrowserWindowConstructorOptions } from "electron";
import path from "node:path";

export class BrowserWindow extends electron.BrowserWindow {
  constructor(opts?: BrowserWindowConstructorOptions) {
    if (!opts || !opts.webPreferences || !opts.webPreferences.preload || !opts.title) {
      super(opts);
      return;
    };
    
    const originalPreload = opts.webPreferences.preload;

    opts.webPreferences.preload = path.join(__dirname, "preload.js");

    super(opts);

    this.VX = { preload: originalPreload };
  };

  static getAllWindows(): Electron.BrowserWindow[] {
    return super.getAllWindows().concat(...electron.BrowserWindow.getAllWindows());
  };
  
  VX?: { preload: string };
};

Object.assign(BrowserWindow, electron.BrowserWindow);

let originalRequire = require;
if (typeof __non_webpack_require__ === "function") {
  originalRequire = __non_webpack_require__!;
  console.log("__non_webpack_require__ is fn")
};

const ELECTRON_PATH = originalRequire.resolve("electron");
const electronCache = originalRequire.cache[ELECTRON_PATH];
if (electronCache) {
  delete electronCache.exports;
  electronCache.exports = { ...electron, BrowserWindow };
};