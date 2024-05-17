import electron from "electron";
import { existsSync } from "node:fs";
import path from "node:path";
import { createStyle, waitForNode } from "common/dom";

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

export function injectOSVars() {
  const { appendTo, setCSS } = createStyle("vx-system-colors", ":root {}");

  function setSystemColors() {
    const colors: Record<string, string> = electron.ipcRenderer.sendSync("@vx/color/get");

    const css: string[] = [];

    for (const key in colors) {
      if (Object.prototype.hasOwnProperty.call(colors, key)) {
        css.push(`\n\t--os-${key}: ${colors[key]};`);
      }
    }

    if (css.length) setCSS(`:root {${css.join("")}\n}`);
    else setCSS(":root { }");
  }

  setSystemColors();

  waitForNode("body").then(appendTo);

  electron.ipcRenderer.on("@vx/color/update", () => setSystemColors());
}