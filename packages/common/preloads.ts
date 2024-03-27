import electron from "electron";
import { existsSync } from "node:fs";
import path from "node:path";

type Path = Parameters<electron.App["getPath"]>[0];

export const getPath = (path: Path) => electron.ipcRenderer.sendSync("@vx/get-path", path) as string;

export function getAndEnsureVXPath(requestPath: string, noExist: (path: string) => void) {
  const appData = getPath("appData");
  const vxDir = path.join(appData, ".vx");
  const filePath = path.join(vxDir, requestPath);  
  
  if (!existsSync(filePath)) noExist(filePath);

  return filePath;
}

export function expose(key: string, api: any) {
  if (process.contextIsolated) electron.contextBridge.exposeInMainWorld(key, api);

  Object.defineProperty(window, key, {
    value: api,
    configurable: false,
    writable: false,
    enumerable: true
  });
}