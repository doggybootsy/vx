import fs from "node:fs";
import path from "node:path";
import electron, { ipcMain } from "electron";

import { THEME_FILENAME_REGEX, PLUGIN_FILENAME_REGEX, IPC, debounce } from "common";
import { BrowserWindow } from "main/window";

const PLUGIN_DIR = path.join(__dirname, "..", "plugins");
const THEME_DIR = path.join(__dirname, "..", "themes");

const cache: Record<VX.AddonType, null | VX.Dict<string>> = { themes: null, plugins: null };

export function getAllAddons(type: VX.AddonType) {
  if (cache[type]) return cache[type];

  const dir = type === "plugins" ? PLUGIN_DIR : THEME_DIR;
  const filenameRegex = type === "plugins" ? PLUGIN_FILENAME_REGEX : THEME_FILENAME_REGEX;

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const addons: VX.Dict<string> = {};

  for (const filename of fs.readdirSync(dir)) {
    if (!filenameRegex.test(filename)) continue;

    addons[filename] = fs.readFileSync(path.join(dir, filename), "binary");
  };

  cache[type] = addons;

  return addons;
};

export function openDir(type: VX.AddonType) {
  const dir = type === "plugins" ? PLUGIN_DIR : THEME_DIR;

  electron.shell.openPath(dir);
};

function watchListener(type: VX.AddonType, event: fs.WatchEventType, filename: string) {
  const dir = type === "plugins" ? PLUGIN_DIR : THEME_DIR;
  const filenameRegex = type === "plugins" ? PLUGIN_FILENAME_REGEX : THEME_FILENAME_REGEX;
  const eventName = type === "plugins" ? IPC.PLUGINS.WATCHER : IPC.THEMES.WATCHER;

  if (!filenameRegex.test(filename)) return;

  const _cache = cache[type];
  if (!_cache) return;
  
  if (event === "change") _cache[filename] = fs.readFileSync(path.join(dir, filename), "binary");
  else delete _cache[filename];

  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(eventName, filename, _cache[filename]);

    ipcMain.emit
  };
};

function watch(type: VX.AddonType) {
  const dir = type === "plugins" ? PLUGIN_DIR : THEME_DIR;

  const listener = debounce((event, filename) => {
    if (!filename) return;
    
    watchListener(type, event, filename);
  }, 500);

  fs.watch(dir, listener);
};

watch("plugins");
watch("themes");