import electron, { safeStorage } from "electron";
import { BrowserWindow } from "./window";
import { request } from "https";
import fs from "original-fs";
import path from "node:path";
import { waitFor } from "common/util";
import { KnownDevToolsPages, OpenDevToolsOptions } from "typings";
import { Storage } from "./storage";

electron.ipcMain.on("@vx/preload", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;

  event.returnValue = BrowserWindow.__getPreloadFromWindow(window);
});

electron.ipcMain.handle("@vx/quit", () => {
  electron.app.quit();
});
electron.ipcMain.handle("@vx/restart", () => {
  electron.app.quit();
  electron.app.relaunch();
});

electron.ipcMain.handle("@vx/update", (event, release: Git.Release) => {
  const asar = release.assets.find((asset) => asset.name.endsWith(".asar"))!;
  
  request(asar.url, { 
    method: "GET",
    headers: {
      accept: asar.content_type,
      "user-agent": electron.session.defaultSession.getUserAgent()
    }
  }, (res) => {
    const codeIndicatesRedirect = 300 <= res.statusCode! && 400 > res.statusCode!;

    const location = res.headers.location;

    if (!(codeIndicatesRedirect && location)) return;
    
    request(location, { 
      method: "GET",
      headers: {
        accept: asar.content_type,
        "user-agent": electron.session.defaultSession.getUserAgent()
      }
    }, (res) => {
      const chunks: Buffer[] = [];
      let size = 0;

      res.on("data", (chunk) => {
        if (!Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk, "binary");

        chunks.push(chunk);
        size += chunk.length;
      });

      res.on("end", () => {
        const data = Buffer.concat(chunks, size);

        const version = release.tag_name.replace(/v/i, "");
        const asar = path.join(__dirname, "..", `${version}.asar`);
        
        fs.writeFileSync(asar, data, { encoding: "binary" });

        electron.app.quit();
        electron.app.relaunch();
      });
    }).end();
  }).end();
});

electron.ipcMain.handle("@vx/splash/no-close", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)!;

  window.close = () => {};
  window.hide = () => {};
});

electron.ipcMain.handle("@vx/devtools/toggle", async (event, options: OpenDevToolsOptions = { }) => {
  if (event.sender.isDevToolsOpened()) {
    event.sender.closeDevTools();
    return;
  }

  event.sender.openDevTools(options as Electron.OpenDevToolsOptions);
  
  await waitFor(() => event.sender.devToolsWebContents);
  const devToolsWebContents = event.sender.devToolsWebContents!;

  if (typeof options.x === "number" && typeof options.y === "number") {
    event.sender.inspectElement(options.x, options.y);
  }
  else if (typeof options.page === "string") {
    devToolsWebContents.executeJavaScript(`try { DevToolsAPI.showPanel(${JSON.stringify(options.page)}); } catch(e) { };`);
  }
  if (typeof options.enterInspectElementMode === "boolean" && options.enterInspectElementMode) {
    devToolsWebContents.executeJavaScript("DevToolsAPI.enterInspectElementMode();");
  }
});
electron.ipcMain.handle("@vx/devtools/enter-inspect-mode", (event) => {
  if (!event.sender.isDevToolsOpened()) return;

  event.sender.devToolsWebContents!.executeJavaScript("DevToolsAPI.enterInspectElementMode();");
});
electron.ipcMain.handle("@vx/devtools/show-page", (event, page: KnownDevToolsPages) => {
  if (!event.sender.isDevToolsOpened()) return;

  event.sender.devToolsWebContents!.executeJavaScript(`try { DevToolsAPI.showPanel(${JSON.stringify(page)}); } catch(e) { };`);
});
electron.ipcMain.handle("@vx/devtools/inspect-coordinates", (event, x, y) => {
  if (!event.sender.isDevToolsOpened()) return;
  event.sender.inspectElement(x, y);
});
electron.ipcMain.on("@vx/devtools/is-open", (event) => {
  event.returnValue = event.sender.isDevToolsOpened();
});

type Path = Parameters<electron.App["getPath"]>[0];

electron.ipcMain.on("@vx/get-path", (event, path: Path) => {
  event.returnValue = electron.app.getPath(path);
});

electron.ipcMain.on("@vx/extensions/get-all", (event) => {
  event.returnValue = electron.session.defaultSession.getAllExtensions();
});

electron.ipcMain.on("@vx/transparency/get-state", (event) => {
  event.returnValue = Storage.window.get("transparent", false);
});
electron.ipcMain.handle("@vx/transparency/set-state", (event, enabled: boolean) => {
  Storage.window.set("transparent", enabled);

  electron.app.quit();
  electron.app.relaunch();
});

electron.ipcMain.on("@vx/safestorage/encrypt", (event, string) => {
  event.returnValue = safeStorage.encryptString(string).toString("base64");
});
electron.ipcMain.on("@vx/safestorage/decrypt", (event, encrypted) => {
  event.returnValue = safeStorage.decryptString(Buffer.from(encrypted, "base64"));
});
electron.ipcMain.on("@vx/safestorage/is-available", (event) => {
  event.returnValue = safeStorage.isEncryptionAvailable();
});
