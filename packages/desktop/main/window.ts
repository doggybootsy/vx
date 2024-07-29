import electron, { BrowserWindowConstructorOptions } from "electron";
import path from "node:path";
import { UndefinedSymbol, Storage } from "./storage";

const preloadSymbol = Symbol.for("vx.browserwindow.preload");

type Vibrancy = BrowserWindowConstructorOptions["vibrancy"];
type BackgroundMaterial = BrowserWindowConstructorOptions["backgroundMaterial"];

export class BrowserWindow extends electron.BrowserWindow {
  static __getPreloadFromWindow(window: BrowserWindow) {
    return window[preloadSymbol];
  }
  
  constructor(opts?: BrowserWindowConstructorOptions) {    
    if (!opts || !opts.webPreferences || !opts.webPreferences.preload) {
      super(opts);
      return;
    }

    const originalPreload = opts.webPreferences.preload;

    if (originalPreload.includes("splash")) {
      opts.webPreferences.preload = path.join(__dirname, "splash.js");
    }
    else if (originalPreload.includes("main")) {
      opts.webPreferences.preload = path.join(__dirname, "main.js");
    }

    const transparent = Storage.window.get<boolean>("transparent", false);

    const backgroundColor = Storage.window.get<string>("backgroundColor", UndefinedSymbol);
    if (typeof backgroundColor === "string") opts.backgroundColor = backgroundColor;
    else if (transparent) opts.backgroundColor = "#00000000";

    if (transparent) {
      opts.transparent = true;

      const vibrancy = Storage.window.get<Vibrancy>("vibrancy", UndefinedSymbol);
      if (typeof vibrancy === "string") opts.vibrancy = vibrancy;

      const backgroundMaterial = Storage.window.get<BackgroundMaterial>("backgroundMaterial", UndefinedSymbol);
      if (typeof backgroundMaterial === "string") opts.backgroundMaterial = backgroundMaterial;
    }

    const window: BrowserWindow = new electron.BrowserWindow(opts);

    window[preloadSymbol] = originalPreload;
    
    // For electron 24.x.x
    window.webContents.on("devtools-open-url", (event, url) => {
      event.preventDefault();

      electron.shell.openExternal(url, { });
    });
    
    return window;
  }
  
  [preloadSymbol]?: string;
};

Object.assign(BrowserWindow, electron.BrowserWindow);
