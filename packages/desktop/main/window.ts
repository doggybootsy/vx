import electron, { BrowserWindowConstructorOptions } from "electron";
import path from "node:path";

const preloadSymbol = Symbol.for("vx.browserwindow.preload");

export class BrowserWindow extends electron.BrowserWindow {
  static __getPreloadFromWindow(window: BrowserWindow) {
    return window[preloadSymbol];
  };

  constructor(opts?: BrowserWindowConstructorOptions) {
    if (!opts || !opts.webPreferences || !opts.webPreferences.preload || !opts.title) {
      super(opts);
      return;
    };

    const originalPreload = opts.webPreferences.preload;

    opts.webPreferences.preload = path.join(__dirname, "preload.js");

    super(opts);

    this[preloadSymbol] = originalPreload;
  };
  
  [preloadSymbol]?: string;
};

Object.assign(BrowserWindow, electron.BrowserWindow);
