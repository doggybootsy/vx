import electron, { BrowserWindowConstructorOptions } from "electron";
import path from "node:path";

const preloadSymbol = Symbol.for("vx.browserwindow.preload");

export class BrowserWindow extends electron.BrowserWindow {
  static __getPreloadFromWindow(window: BrowserWindow) {
    return window[preloadSymbol];
  };

  constructor(opts?: BrowserWindowConstructorOptions) {
    if (!opts || !opts.webPreferences || !opts.webPreferences.preload) {
      super(opts);
      return;
    };

    const originalPreload = opts.webPreferences.preload;

    if (originalPreload.includes("splash")) {
      opts.webPreferences.preload = path.join(__dirname, "splash.js");
    }
    else if (originalPreload.includes("main")) {
      opts.webPreferences.preload = path.join(__dirname, "main.js");
    };

    const window: BrowserWindow = new electron.BrowserWindow(opts);

    window.close = () => false;
    window.hide = () => false;

    window[preloadSymbol] = originalPreload;

    return window;
  };
  
  [preloadSymbol]?: string;
};

Object.assign(BrowserWindow, electron.BrowserWindow);
