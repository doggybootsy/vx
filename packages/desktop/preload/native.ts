import { getAndEnsureVXPath } from "common/preloads";
import electron from "electron";
import { mkdirSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const native = {
  app: {
    quit() {
      electron.ipcRenderer.invoke("@vx/quit");
    },
    restart() {
      electron.ipcRenderer.invoke("@vx/restart");
    }
  },
  extensions: {
    open() {
      const extensionsDir = getAndEnsureVXPath("extensions", (path) => mkdirSync(path));
      
      electron.shell.openPath(extensionsDir);
    }
  },
  themes: {
    delete(filename: string) {
      const themesDir = getAndEnsureVXPath("themes", (path) => mkdirSync(path));
      
      const filepath = path.join(themesDir, filename);

      return electron.shell.trashItem(filepath);
    },
    open() {
      const themesDir = getAndEnsureVXPath("themes", (path) => mkdirSync(path));
      
      electron.shell.openPath(themesDir);
    },
    async getAll() {
      const themesDir = getAndEnsureVXPath("themes", (path) => mkdirSync(path));

      const files = await readdir(themesDir);

      const regex = /\.theme\.css$/;
      const filteredFiles = files.filter((value) => regex.test(value));

      const entries = await Promise.all(
        filteredFiles.map(async (file) => {
          const content = await readFile(path.join(themesDir, file), "binary");
          return [ file, content ];
        })
      );

      return Object.fromEntries(entries);
    }
  },
  clipboard: {
    copy(text: string) {
      electron.clipboard.writeText(text);
    }
  }
};

electron.contextBridge.exposeInMainWorld("VXNative", native);
window.VXNative = native;

export type NativeObject = typeof native;