import electron from "electron";
import { BrowserWindow } from "./window";
import { request } from "https";
import fs from "original-fs";
import path from "node:path";

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
        const asar = path.join(__dirname, "..", `${version}.asar`)
        
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

electron.ipcMain.handle("@vx/splash/devtools", (event) => {
  if (event.sender.isDevToolsOpened()) {
    event.sender.closeDevTools();
    return;
  };

  event.sender.openDevTools({ mode: "detach" });
});

type Path = Parameters<electron.App["getPath"]>[0];

electron.ipcMain.on("@vx/get-path", (event, path: Path) => {
  event.returnValue = electron.app.getPath(path);
});

electron.ipcMain.on("@vx/extensions/get-all", (event) => {
  event.returnValue = electron.session.defaultSession.getAllExtensions();
});