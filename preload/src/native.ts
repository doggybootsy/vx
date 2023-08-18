import electron from "electron";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, watch, writeFileSync } from "node:fs";
import path, { join } from "node:path";

const native: VX.Native = {
  path,
  readDir: (dir: string) => readdirSync(dir, "utf-8"),
  readFile: (file: string) => readFileSync(file, "utf-8"),
  writeFile: (file: string, data: string) => writeFileSync(file, data, "utf-8"),
  mkdir: (dir: string) => mkdirSync(dir),
  exists: (path: string) => existsSync(path),
  delete: (path: string) => electron.shell.trashItem(path),
  openPath: (path: string) => electron.shell.openPath(path),
  isDir: (path: string) => native.exists(path) && statSync(path).isDirectory(),
  openExternal: (url: string) => electron.shell.openExternal(url, { }),
  watch(dir: string, callback: (filename: string, action: "deleted" | "change") => void): () => void {
    const cached = new Map<string, NodeJS.Timeout>();
    const watcher = watch(dir, "utf-8", (event, filename) => {      
      clearTimeout(cached.get(filename!));

      cached.set(filename!, setTimeout(() => {
        let action: "change" | "deleted" = "change";
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
  quit: (restart = false) => electron.ipcRenderer.send("@vx/quit", restart)
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

// Concept to keep protos and such
// function remakeOBJ(descriptorsArray) {
//   const obj = {};
//   let last = obj;

//   Object.defineProperties(obj, descriptorsArray.shift());

//   function a(descriptors) {
//     if (!descriptors) return;

//     const proto = Object.defineProperties({ }, descriptors)

//     Object.setPrototypeOf(
//       last,
//       proto
//     );

//     last = proto;

//     a(descriptorsArray.shift());
//   };

//   a(descriptorsArray.shift());

//   return obj;
// };