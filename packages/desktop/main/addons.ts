import { app, WebContents } from "electron";
import { watch } from "chokidar";
import { existsSync, mkdirSync } from "fs";
import path, { basename, extname } from "path";

const appData = app.getPath("appData");
const vxDir = path.join(appData, ".vx");

if (!existsSync(vxDir)) mkdirSync(vxDir);

export function setupWindow(webContents: WebContents) {
  function createWatcher(type: "themes" | "plugins") {
    const dir = path.join(vxDir, type);
    if (!existsSync(dir)) mkdirSync(dir);
  
    const watcher = watch(dir, {
      awaitWriteFinish: true,
      ignoreInitial: true,
      atomic: true
    });
    
    const requiredExt = type === "themes" ? ".css" : ".js";

    watcher.on("all", (eventName, path) => {  
      const filename = basename(path);
      const ext = extname(path);
      
      if (ext !== requiredExt) return;

      webContents.send(`@vx/addons/${type}`, eventName, filename);
    });
  }
  
  createWatcher("plugins");
  createWatcher("themes");
}