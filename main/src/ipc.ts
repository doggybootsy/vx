import "polyfills";

import electron from "electron";

import { BrowserWindow } from "main/window";
import * as storage from "main/storage";
import * as addons from "main/addons";
import { IPC } from "common";

electron.ipcMain.on(IPC.PRELOAD, (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) as BrowserWindow;
  if (!window || !window.VX) return event.returnValue = "";
  event.returnValue = window.VX.preload;
});
electron.ipcMain.on(IPC.QUIT, (event, restart = false) => {
  electron.app.quit();
  if (restart) electron.app.relaunch({ });

  event.returnValue = restart;
});
electron.ipcMain.on(IPC.STORAGE.GET_ALL, (event, id: string) => {
  event.returnValue = JSON.stringify(storage.getAll(id));
});
electron.ipcMain.on(IPC.STORAGE.SET_ITEM, (event, id: string, key: string, value: string) => {
  storage.setItem(id, key, value);
});
electron.ipcMain.on(IPC.STORAGE.DELETE_ITEM, (event, id: string, key: string) => {
  storage.deleteItem(id, key);
});
electron.ipcMain.on(IPC.STORAGE.GET_ITEM, (event, id: string, key: string) => {
  event.returnValue = JSON.stringify(storage.getItem(id, key));
});
electron.ipcMain.on(IPC.STORAGE.HAS_ITEM, (event, id: string, key: string) => {
  event.returnValue = storage.hasItem(id, key);
});
electron.ipcMain.on(IPC.STORAGE.CLEAR_CACHE, (event, id?: string) => {
  storage.clearCache(id);
});
electron.ipcMain.on(IPC.PLUGINS.GET_ALL, (event) => {
  event.returnValue = JSON.stringify(addons.getAllAddons("plugins"));
});
electron.ipcMain.on(IPC.PLUGINS.OPEN, (event) => {
  addons.openDir("plugins");
});
electron.ipcMain.on(IPC.THEMES.GET_ALL, (event) => {
  event.returnValue = JSON.stringify(addons.getAllAddons("themes"));
});
electron.ipcMain.on(IPC.THEMES.OPEN, (event) => {
  addons.openDir("themes");
});