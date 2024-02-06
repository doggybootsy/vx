import { getAndEnsureVXPath } from "common/preloads";
import electron from "electron";
import JSZip from "jszip";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "vx:self";
import { OpenDevToolsOptions, KnownDevToolsPages } from "typings";

const native = {
  app: {
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
      };

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
          
          if (file.dir) {
            mkdirSync(path);
          }
          else {
            writeFileSync(path, await file.async("nodebuffer"));
          }
        }
      }

      native.app.restart();
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
  }
};

electron.contextBridge.exposeInMainWorld("VXNative", native);
window.VXNative = native;

export type NativeObject = typeof native;