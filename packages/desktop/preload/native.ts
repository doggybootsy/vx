import electron from "electron";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const getPath = (path: "home" | "appData" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps") => electron.ipcRenderer.sendSync("@vx/get-path", path) as string;

async function ensureVXPath(requestedPath: string) {
  const appData = getPath("appData");
  const vxDir = path.join(appData, ".vx");
  const dir = path.join(vxDir, requestedPath);

  if (!existsSync(vxDir)) await mkdir(vxDir);
  if (!existsSync(dir)) await mkdir(dir);

  return dir;
};

const native = {
  updater: {
    update() {
      electron.ipcRenderer.invoke("@vx/update");
    }
  },
  app: {
    quit() {
      electron.ipcRenderer.invoke("@vx/quit");
    },
    restart() {
      electron.ipcRenderer.invoke("@vx/restart");
    }
  },
  extensions: {
    async open() {
      const extensionsDir = await ensureVXPath("extensions");
      
      electron.shell.openPath(extensionsDir);
    }
  },
  themes: {
    async delete(filename: string) {
      const themesDir = await ensureVXPath("themes");
      
      const filepath = path.join(themesDir, filename);

      return electron.shell.trashItem(filepath);
    },
    async open() {
      const themesDir = await ensureVXPath("themes");
      
      electron.shell.openPath(themesDir);
    },
    async getAll() {
      const themesDir = await ensureVXPath("themes");

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