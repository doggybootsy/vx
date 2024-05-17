import { IS_DESKTOP, git } from "vx:self";
import { DataStore } from "./api/storage";

export const extensions = {
  open() {
    if (!IS_DESKTOP) return;
    window.VXNative!.extensions.open();
  },
  getAll() {
    if (!IS_DESKTOP) return [];
    return window.VXNative!.extensions.getAll();
  },
  downloadRDT() {
    if (!IS_DESKTOP) return;
    window.VXNative!.extensions.downloadRDT();
  }
};

export const app = {
  quit() {
    if (!IS_DESKTOP) return;
    window.VXNative!.app.quit();
  },
  restart() {
    if (!IS_DESKTOP) return location.reload();
    window.VXNative!.app.restart();
  }
};

export const updater = {
  async getLatestRelease(): Promise<Git.Release> {
    if (!git.exists) throw new Error("No Git Details Exist");

    const endpoint = `https://api.github.com/repos/${git.url.split("/").slice(-2).join("/")}/releases/latest`;

    const response = await window.fetch(endpoint, { cache: "no-cache" });

    return await response.json();
  },
  update(release: Git.Release) {
    if (!IS_DESKTOP) {
      window.VXExtension!.update(release);
      return;
    }

    window.VXNative!.updater.update(release);
  }
};

export const transparency = {
  set(state: boolean) {
    if (!IS_DESKTOP) return;
    return window.VXNative!.transparency.set(state);
  },
  get() {
    if (!IS_DESKTOP) return false;
    return window.VXNative!.transparency.get();
  }
};

type AddonListener = (eventName: ChokidarFileEvent, filename: string) => void;
const addonStateStore = new DataStore<Record<string, boolean>>("VXI-Addon-States");

function createAddonAPI(type: "themes" | "plugins") {
  let baseObject: NonNullable<typeof window.VXNative>["themes"];

  if (IS_DESKTOP) baseObject = window.VXNative![type];
  else {
    const addonStore = new DataStore<Record<string, string>>(`VXI-${type}`);
    
    const listeners = new Set<AddonListener>();

    function emit(eventName: ChokidarFileEvent, filename: string) {
      for (const listener of listeners) listener(eventName, filename);
    }

    baseObject = {
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
      getAll(): string[] {
        return addonStore.keys();
      },
      exists(filename: string) {
        return addonStore.has(filename);
      },
      read(filename: string) {
        if (!addonStore.has(filename)) throw new Error("Addon doesn't exist");
        return addonStore.get(filename)!;
      },
      write(filename: string, content: string) {
        addonStore.set(filename, content);
        emit("change", filename);
      },
      async delete(filename: string) {
        addonStore.delete(filename);
        emit("unlink", filename);
      },
      async open(filename: string) {
        const { openWindow } = await (type === "themes" ? import("./dashboard/pages/addons/themes/popout.js") : import("./dashboard/pages/addons/plugins/popout.js"));
        openWindow(filename);
      },
      async openDirectory() {
        // Cant. Maybe have the ext open a page? or a devtools page? idk
      }
    }
  }

  return {
    ...baseObject,
    isEnabled(filename: string) {
      if (addonStateStore.has(filename)) return addonStateStore.get(filename)!;
      return false;
    },
    setEnabledState(filename: string, state: boolean) {
      addonStateStore.set(filename, state);
    }
  }
}

const themes = createAddonAPI("themes");
const plugins = createAddonAPI("plugins");

export const addons = { themes, plugins };