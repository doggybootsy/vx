import electron from "electron";

import "main/requests";
import { BrowserWindow } from "main/window";

electron.ipcMain.on("@vx/preload", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) as BrowserWindow;
  if (!window || !window.VX) return event.returnValue = "";
  event.returnValue = window.VX.preload;
});
electron.ipcMain.on("@vx/quit", (event, restart = false) => {
  electron.app.quit();
  if (restart) electron.app.relaunch({ });

  event.returnValue = restart;
});

process.stdout.write(`Starting VX (${VXEnvironment.VERSION}).\n`);