import electron from "electron";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, watch, writeFileSync } from "node:fs";
import path, { join } from "node:path";

const native: VX.Native = {
  path,
  readDir: (dir: string) => readdirSync(dir, "utf-8"),
  readFile: ((file: string, buffer: BufferEncoding | true = "utf-8") => {
    if (buffer === true) return readFileSync(file);
    return readFileSync(file, buffer);
  }) as VX.Native["readFile"],
  writeFile: (file: string, data: string) => writeFileSync(file, data, "utf-8"),
  mkdir: (dir: string) => mkdirSync(dir),
  exists: (path: string) => existsSync(path),
  delete: (path: string) => electron.shell.trashItem(path),
  openPath: (path: string) => electron.shell.openPath(path),
  isDir: (path: string) => native.exists(path) && statSync(path).isDirectory(),
  openExternal: (url: string) => electron.shell.openExternal(url, { }),
  watch(dir: string, callback: (filename: string, action: VX.WatchAction) => void): () => void {
    const cached = new Map<string, NodeJS.Timeout>();
    const watcher = watch(dir, "utf-8", (event, filename) => {      
      clearTimeout(cached.get(filename!));

      cached.set(filename!, setTimeout(() => {
        let action: VX.WatchAction = "change";
        if (!existsSync(join(dir, filename!))) action = "deleted";

        callback(filename!, action);
      }, 500));
    });

    return () => watcher.close();
  },
  stats(path) {
    return statSync(path, { bigint: false });
  },
  dirname: __dirname,
  platform: process.platform,
  quit: (restart = false) => electron.ipcRenderer.send("@vx/quit", restart),
  storage: {
    getAll(id: string): Record<string, any> {
      return JSON.parse(electron.ipcRenderer.sendSync("@vx/storage/get-all", id));
    },
    deleteItem(id: string, key: string) {
      electron.ipcRenderer.send("@vx/storage/delete-item", id, key);
    },
    setItem(id: string, key: string, value: any) {
      electron.ipcRenderer.send("@vx/storage/set-item", id, key, JSON.stringify(value));
    },
    getItem(id: string, key: string, defaultValue: any) {
      if (!native.storage.hasItem(id, key)) return defaultValue;

      return JSON.parse(electron.ipcRenderer.sendSync("@vx/storage/get-item", id, key));
    },
    hasItem(id: string, key: string) {
      return electron.ipcRenderer.sendSync("@vx/storage/has-item", id, key);
    }
  }
};

let hasGottenNative = false;

electron.contextBridge.exposeInMainWorld("VXNative", () => {
  // Only allow once | unless in development
  if (VXEnvironment.PRODUCTION && hasGottenNative) {
    console.warn("Addons cannot access 'VXNative'!");
    return null;
  };

  hasGottenNative = true;
  return native;
});

window.VXNative = () => native;
