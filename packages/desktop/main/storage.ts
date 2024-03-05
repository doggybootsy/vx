import electron from "electron";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

export const UndefinedSymbol = Symbol("Storage.undefined");

export class Storage {
  constructor(public readonly name: string) {
    const appData = electron.app.getPath("appData");
    const vxDir = path.join(appData, ".vx");
    const fullpath = path.join(vxDir, `${name}.json`);

    if (!existsSync(fullpath)) writeFileSync(fullpath, "{}", "binary");

    this.#fullpath = fullpath;
    require(fullpath);
  }
  #fullpath: string;
  
  get<T>(key: string, defaultValue: T): T
  get<T>(key: string, defaultValue: typeof UndefinedSymbol): T | undefined
  get<T>(key: string, defaultValue: T): T {
    const data = require(this.#fullpath);

    if (typeof data[key] !== "undefined") return data[key];
    if (defaultValue === UndefinedSymbol) return undefined as any;
    return defaultValue as any;
  }
  set(key: string, value: any) {
    const data = require(this.#fullpath);

    data[key] = value;

    writeFileSync(this.#fullpath, JSON.stringify(data, null, "\t"));
  }
  path() { return this.#fullpath; }
}

export const windowStorage = new Storage("window");