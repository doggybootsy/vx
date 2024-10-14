import electron, { BrowserWindowConstructorOptions } from "electron";
import path from "node:path";
import { UndefinedSymbol, Storage } from "./storage";
import { env } from "vx:self";

const preloadSymbol = Symbol.for("vx.browserwindow.preload");

type Vibrancy = BrowserWindowConstructorOptions["vibrancy"];
type BackgroundMaterial = BrowserWindowConstructorOptions["backgroundMaterial"];

const script = `(async function() {
  function deepQuerySelector(node, selector) {
    if (!node) return null;

    // Check the current node
    const found = node.querySelector(selector);
    if (found) return found;

    if (node.shadowRoot) {
      const shadowResult = deepQuerySelector(node.shadowRoot, selector);
      if (shadowResult) return shadowResult;
    }

    for (let child of node.children) {
      const childResult = deepQuerySelector(child, selector);
      if (childResult) return childResult;
    }

    return null;
  }

  const header = deepQuerySelector(document, ".tabbed-pane-header");

  const icon = document.createElement("div");
  icon.innerHTML = '<svg class="vx-icon vx-icon-logo" width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path fill="currentcolor" d="M51.4697 27.0801L38.96 74.6582L22.0068 75.6152L6.62598 27.5586L22.8271 26.0547L29.3896 54.082L35.7471 26.0547L51.4697 27.0801ZM93.75 27.0801L80.4199 50.2539L91.7676 70.4199L77.4805 74.8633L71.3281 60.918L64.082 74.9316L49.3164 69.5996L61.8945 49.7754L50.4102 28.9258L66.0645 25.166L71.6699 38.9062L77.6172 25.166L93.75 27.0801Z"></path></svg>';
  icon.title = "VX v${env.VERSION}";
  icon.style.display = "flex";
  icon.style.alignItems = "center";
  icon.style.padding = "0 2px";
  icon.style.minWidth = "22px";

  header.insertBefore(icon, header.firstChild);
})();`

function attemptFixDevtools() {
  // 32.x.xdoesnt save devtools pref properly
  if (!/^32\.\d+.\d+$/.test(process.versions.electron)) return;
  if (electron.nativeTheme.themeSource === "light") return;

  const { themeSource } = electron.nativeTheme;

  electron.nativeTheme.themeSource = "light";

  setTimeout(() => {
    electron.nativeTheme.themeSource = themeSource;
  });
}

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
    else if (originalPreload.includes("main") || originalPreload.includes("betterdiscord")) {
      opts.webPreferences.preload = path.join(__dirname, "main.js");

      // Only apply if it is the main window
      if (Storage.window.get<boolean>("native-frame", false)) {
        opts.frame = true;
      }
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

      electron.shell.openExternal(url, { })
    });

    window.webContents.on("devtools-opened", () => {
      window.webContents.devToolsWebContents?.executeJavaScript(script);
      
      attemptFixDevtools();
    });
    
    // Open devtools in devtools
    // const devtools = new electron.BrowserWindow();
    // devtools.webContents.openDevTools({ mode: "right" });

    // window.webContents.setDevToolsWebContents(devtools.webContents);
    // window.webContents.openDevTools();
    
    return window;
  }
  
  [preloadSymbol]?: string;
};

Object.assign(BrowserWindow, electron.BrowserWindow);
