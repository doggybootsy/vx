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