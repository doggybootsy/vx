import electron, { BrowserWindowConstructorOptions } from "electron";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const preloadSymbol = Symbol.for("vx.browserwindow.preload");

export class BrowserWindow extends electron.BrowserWindow {
  static __getPreloadFromWindow(window: BrowserWindow) {
    return window[preloadSymbol];
  }
  static __VXWindowsSettings = {
    path() {
      const appData = electron.app.getPath("appData");
      const vxDir = path.join(appData, ".vx");
      return path.join(vxDir, "window.json");
    },
    get() {
      const jsonFile = this.path();
      
      if (!existsSync(jsonFile)) this.set({ });
      return require(jsonFile);
    },
    set(value: any) {
      writeFileSync(this.path(), JSON.stringify(value, null, "\t"), "binary");
    },
    save() {
      this.set(this.get());
    }
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

    const data = BrowserWindow.__VXWindowsSettings.get();
    if (typeof data.transparent === "boolean" && data.transparent) {
      opts.transparent = data.transparent;
      opts.backgroundColor = "#00000000";

      if (typeof data.vibrancy === "string") opts.vibrancy = data.vibrancy;
      if (typeof data.backgroundMaterial === "string") opts.backgroundMaterial = data.backgroundMaterial;  
    }

    const window: BrowserWindow = new electron.BrowserWindow(opts);

    window[preloadSymbol] = originalPreload;
    
    // window.webContents.on("devtools-open-url", (event, url) => {
    //   electron.shell.openExternal(url);
    // });

    return window;
  }
  
  [preloadSymbol]?: string;
};

Object.assign(BrowserWindow, electron.BrowserWindow);
