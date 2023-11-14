import { getAndEnsureVXPath } from "common/preloads";
import electron from "electron";
import { mkdirSync } from "node:fs";
import { fetch } from "./fetch";

const native = {
  app: {
    quit() {
      electron.ipcRenderer.invoke("@vx/quit");
    },
    restart() {
      electron.ipcRenderer.invoke("@vx/restart");
    }
  },
  net: {
    fetch
  },
  extensions: {
    open() {
      const extensionsDir = getAndEnsureVXPath("extensions", (path) => mkdirSync(path));
      
      electron.shell.openPath(extensionsDir);
    }
  },
  clipboard: {
    copy(text: string) {
      electron.clipboard.writeText(text);
    }
  },
  updater: {
    update(release: Git.Release) {
      electron.ipcRenderer.invoke("@vx/update", release);
    }
  },
  util: {
    // Cross context abort controller | for fetch
    AbortController() {
      const controller = new AbortController();

      return {
        abort(reason?: any) {
          if (controller.signal.aborted) throw new Error("AbortController was already aborted!");
          return controller.abort(reason);
        },
        reason() {
          if (controller.signal.aborted) return controller.signal.reason;
          throw new Error("AbortController must be aborted!");
        },
        aborted() { return controller.signal.aborted },
        addEventListener(...args: Parameters<AbortSignal["addEventListener"]>) { return controller.signal.addEventListener.apply(controller.signal, args); },
        removeEventListener(...args: Parameters<AbortSignal["removeEventListener"]>) { return controller.signal.removeEventListener.apply(controller.signal, args); }
      };
    }
  }
};

electron.contextBridge.exposeInMainWorld("VXNative", native);
window.VXNative = native;

export type NativeObject = typeof native;