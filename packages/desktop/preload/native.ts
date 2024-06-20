import { expose, getAndEnsureVXPath } from "common/preloads";
import electron, { ipcRenderer } from "electron";
import JSZip from "jszip";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { env } from "vx:self";
import { OpenDevToolsOptions, KnownDevToolsPages } from "typings";
import { watch } from "chokidar";

type AddonListener = (eventName: ChokidarFileEvent, filename: string) => void;

function createAddonAPI(type: "themes" | "plugins") {
  const path = getAndEnsureVXPath(type, (path) => mkdirSync(path));
  
  const watcher = watch(path, {
    awaitWriteFinish: true,
    ignoreInitial: true,
    atomic: true
  });

  const listeners = new Set<AddonListener>();

  const requireExt = type === "themes" ? ".css" : ".js";

  watcher.on("all", (eventName, path) => {
    const filename = basename(path);
    const ext = extname(path);
    if (ext !== requireExt) return;

    for (const listener of listeners) {
      listener(eventName, filename);
    }
  });

  return {
    type,
    addListener(listener: AddonListener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener)
      };
    },
    removeListener(listener: AddonListener) {
      listeners.delete(listener);
    },
    getAll() {
      const ext = type === "themes" ? ".css" : ".js";
      return readdirSync(path).filter((filename) => extname(filename) === ext); 
    },
    exists(filename: string) {
      return existsSync(join(path, basename(filename)));
    },
    read(filename: string) {
      return readFileSync(join(path, basename(filename)), "binary");
    },
    write(filename: string, content: string) {
      writeFileSync(join(path, basename(filename)), content, "binary");
    },
    delete(filename: string) {
      return electron.shell.trashItem(join(path, basename(filename)));
    },
    async open(filename: string) {
      const result = await electron.shell.openPath(join(path, basename(filename)));
      if (result) console.warn(result);
    },
    async openDirectory() {
      const result = await electron.shell.openPath(path);
      if (result) console.warn(result);
    }
  }
}

const storageCache = new Map<string, string>();

const native = {
  release: electron.ipcRenderer.sendSync("DISCORD_APP_GET_RELEASE_CHANNEL_SYNC") as string,
  themes: createAddonAPI("themes"),
  plugins: createAddonAPI("plugins"),
  app: {
    platform: process.platform,
    quit() {
      electron.ipcRenderer.invoke("@vx/quit");
    },
    restart() {
      electron.ipcRenderer.invoke("@vx/restart");
    }
  },
  devtools: {
    toggle(options?: OpenDevToolsOptions) {
      const isOpen = native.devtools.isOpen();
      electron.ipcRenderer.invoke("@vx/devtools/toggle", options);
      return !isOpen;
    },
    open(options?: OpenDevToolsOptions) {
      if (native.devtools.isOpen()) return false;
      native.devtools.toggle(options);
      return true;
    },
    close() {
      if (!native.devtools.isOpen()) return false;
      native.devtools.toggle();
      return true;
    },
    isOpen() {
      return electron.ipcRenderer.sendSync("@vx/devtools/is-open");
    },
    inspectCoordinates(x: number, y: number) {
      if (native.devtools.isOpen()) {
        electron.ipcRenderer.invoke("@vx/devtools/inspect-coordinates", x, y);
        return;
      }

      native.devtools.open({ x, y });
    },
    showPage(page: KnownDevToolsPages) {
      if (native.devtools.isOpen()) {
        electron.ipcRenderer.invoke("@vx/devtools/show-page", page);
        return;
      }

      native.devtools.open({ page });
    },
    enterInspectMode() {
      if (native.devtools.isOpen()) {
        electron.ipcRenderer.invoke("@vx/devtools/enter-inspect-mode");
        return;
      }

      native.devtools.open({ enterInspectElementMode: true, page: "elements" });
    }
  },
  extensions: {
    open() {
      const extensionsDir = getAndEnsureVXPath("extensions", (path) => mkdirSync(path));
      
      electron.shell.openPath(extensionsDir);
    },
    getAll(): Electron.Extension[] {
      return electron.ipcRenderer.sendSync("@vx/extensions/get-all");
    },
    async downloadRDT() {      
      const res = await fetch(env.RDT.DOWNLOAD_URL, { cache: "force-cache" });

      const zip = await new JSZip().loadAsync(await res.blob());

      const extensionsDir = getAndEnsureVXPath("extensions", (path) => mkdirSync(path));
      const dir = join(extensionsDir, env.RDT.ID);

      rmSync(dir, { force: true, recursive: true });

      mkdirSync(dir);

      for (const key in zip.files) {
        if (Object.prototype.hasOwnProperty.call(zip.files, key)) {
          const file = zip.files[key];
          const path = join(dir, key);
          
          if (file.dir) mkdirSync(path);
          else writeFileSync(path, await file.async("nodebuffer"));
        }
      }

      native.app.restart();
    }
  },
  clipboard: {
    copy(text: string) {
      electron.clipboard.writeText(text);
    },
    read() {
      return electron.clipboard.readText("clipboard");
    }
  },
  updater: {
    update(release: Git.Release) {
      electron.ipcRenderer.invoke("@vx/update", release);
    }
  },
  transparency: {
    get(): boolean {
      return electron.ipcRenderer.sendSync("@vx/transparency/get-state");
    },
    set(state: boolean) {
      electron.ipcRenderer.invoke("@vx/transparency/set-state", state);
    }
  },
  safestorage: {
    decrypt(string: string): string {
      if (!native.safestorage.isAvailable()) throw new DOMException("SafeStorage is not available!");
      const { error, result } = electron.ipcRenderer.sendSync("@vx/safestorage/decrypt", string);
      if (error) throw new Error("Failed to decrypt the text");
      return result;
    },
    encrypt(string: string): string {
      if (!native.safestorage.isAvailable()) throw new DOMException("SafeStorage is not available!");
      return electron.ipcRenderer.sendSync("@vx/safestorage/encrypt", string);
    },
    isAvailable(): boolean {
      return electron.ipcRenderer.sendSync("@vx/safestorage/is-available");
    }
  },
  storage: {
    get(key: string): string | null {
      if (storageCache.has(key)) return storageCache.get(key)!;

      getAndEnsureVXPath("storage", (path) => mkdirSync(path));
      const path = getAndEnsureVXPath(`storage/${native.release}`, (path) => mkdirSync(path));

      const file = join(path, `${basename(key)}.vxs`);

      if (!existsSync(file)) return null;

      const data = readFileSync(file, "binary");
      const match = data.match(/^vx-(0|1):([\s\S]+)$/);

      if (!match) {
        native.storage.delete(key)
        return null;
      }

      const [, type, contents ] = match;

      // 0 === not encrypted | 1 === encrypted
      if (type === "0") {
        const data = Buffer.from(contents, "base64").toString("binary");
        storageCache.set(key, data);
        
        return data;
      }
      if (native.safestorage.isAvailable()) {
        const data = native.safestorage.decrypt(contents);
        storageCache.set(key, data);
        
        return data;
      }
      return null;
    },
    set(key: string, value: string) {
      storageCache.set(key, value);

      getAndEnsureVXPath("storage", (path) => mkdirSync(path));
      const path = getAndEnsureVXPath(`storage/${native.release}`, (path) => mkdirSync(path));

      const file = join(path, `${basename(key)}.vxs`);

      const isAvailable = native.safestorage.isAvailable();

      const data = isAvailable ? native.safestorage.encrypt(value) : Buffer.from(value, "binary").toString("base64");

      writeFileSync(file, `vx-${isAvailable ? 1 : 0}:${data}`, "binary");
    },
    delete(key: string) {
      storageCache.delete(key);

      getAndEnsureVXPath("storage", (path) => mkdirSync(path));
      const path = getAndEnsureVXPath(`storage/${native.release}`, (path) => mkdirSync(path));

      const file = join(path, `${key}.vxs`);
      
      if (!existsSync(file)) return;

      unlinkSync(file);
    }
  },
  spotify: {
    getVolume() {
      return ipcRenderer.sendSync("@vx/spotify-embed-volume/get");
    },
    setVolume(volume: number) {
      ipcRenderer.invoke("@vx/spotify-embed-volume/set", volume);
    }
  }
};

expose("VXNative", native);

export type NativeObject = typeof native;