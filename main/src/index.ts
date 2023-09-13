import "polyfills";

import electron from "electron";

import "main/requests";
import { BrowserWindow } from "main/window";
import * as storage from "main/storage";

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
electron.ipcMain.on("@vx/storage/get-all", (event, id: string) => {
  event.returnValue = JSON.stringify(storage.getAll(id));
});
electron.ipcMain.on("@vx/storage/set-item", (event, id: string, key: string, value: string) => {
  storage.setItem(id, key, value);
});
electron.ipcMain.on("@vx/storage/delete-item", (event, id: string, key: string) => {
  storage.deleteItem(id, key);
});
electron.ipcMain.on("@vx/storage/get-item", (event, id: string, key: string) => {
  event.returnValue = JSON.stringify(storage.getItem(id, key));
});
electron.ipcMain.on("@vx/storage/has-item", (event, id: string, key: string) => {
  event.returnValue = storage.hasItem(id, key);
});

process.stdout.write(`Starting VX (${VXEnvironment.VERSION}).\n`);