import electron from "electron";
import { BrowserWindow } from "./window";

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

electron.ipcMain.handle("@vx/splash/no-close", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)!;

  window.close = () => false;
  window.hide = () => false;
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