import { getAndEnsureVXPath } from "common/preloads";
import electron from "electron";
import JSZip from "jszip";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "self";

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