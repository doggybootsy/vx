import { Messages } from "i18n";
import { DataStore } from "../../api/storage";
import { InternalStore, download, getDiscordTag, isInvalidSyntax, showFilePicker } from "../../util";
import { UserStore } from "@webpack/common";
import { Meta, getMeta, getMetaProperty } from "../meta";

export interface PluginObject {
  js: string,
  enabled: boolean
};

type DataStoreType = Record<string, PluginObject>;

const pluginDataStore = new DataStore<DataStoreType>("VX-Plugins", {
  version: 1
});

interface PluginExport {
  Settings?: React.ComponentType,
  start?(): void,
  stop?(): void,
  delete?(): void
}

type PluginExports = ({
  __esModule: true,
  default?: PluginExport
} & PluginExport) | PluginExport;

interface PluginModule {
  id: string,
  exports: PluginExports,
  loaded: boolean,
  enabled: boolean,
  meta: Record<string, string | null>
};

const metaCache = new Map<string, Meta>();

const defaultPlugin = (id: string) => {
  const user = UserStore.getCurrentUser();

  return `/**
 * @name 0 New Plugin - ${id}
 * @author ${getDiscordTag(user)}
 * @authorId ${user.id}
 * @version 1.0.0
 */

exports.start = () => console.log("Started");
exports.stop = () => console.log("Stopped");`;
};

export const pluginStore = new class PluginStore extends InternalStore {
  constructor() {
    super();

    this.#plugins = pluginDataStore.getAll() as DataStoreType;
    this.#evaledPlugins = {};
  }
  #plugins: DataStoreType;
  #evaledPlugins: Record<string, PluginExports>;

  public displayName = "PluginStore";

  private evalPlugin(id: string) {
    const code = this.getJS(id);

    const rawModule = new Function("module", "exports", `"use strict";\n${code}\n//# sourceURL=vx://VX/plugins/${id}.js`);

    let loaded = false;

    const self = this;
    const module: PluginModule = {
      id: id,
      exports: {},
      get loaded() { return loaded; },
      get enabled() { return self.isEnabled(id); },
      meta: new Proxy({}, {
        get(target, key) {
          return (target as any)[key] = self.getMetaProperty(id, key as string, null as unknown as string);
        },
        set() { return false },
        deleteProperty() { return false },
        defineProperty() { return false }
      })
    };

    try {
      rawModule.call(window, module, module.exports);
    } 
    catch (error) {
      console.warn(`[VX~Plugins]: Plugin '${this.getName(id)}' (${id}), while VX was trying to start it`, error);
    }

    this.#evaledPlugins[id] = module.exports;

    loaded = true;

    if (this.isEnabled(id)) this.runMethod(id, "start");

    return module;
  };
  private _updateData(callback: (clone: Record<string, PluginObject>) => void) {    
    const clone = structuredClone(this.#plugins);

    callback(clone);
    
    pluginDataStore.replace(clone);

    this.#plugins = clone;
    this.emit();
  };

  public getJS(id: string) {
    return this.#plugins[id].js;
  };
  public updateJS(id: string, js: string) {
    const enabled = this.isEnabled(id);
    
    this.delete(id);
    
    this._updateData((clone) => {
      clone[id] = {
        js: js,
        enabled: enabled
      };
    });

    this.evalPlugin(id);
  };

  public getMeta(id: string) {
    if (metaCache.has(id)) return metaCache.get(id)!;
    return getMeta(this.getJS(id));
  };
  public getMetaProperty(id: string, key: string, defaultValue: string) {
    return getMetaProperty(this.getMeta(id), key, defaultValue);
  };
  public getAuthors(id: string) {
    return getMeta(id).authors ?? [];
  };
  public getName(id: string) {
    return this.getMetaProperty(id, "name", Messages.UNKNOWN_NAME);
  };
  public getVersionName(id: string) {
    const version = this.getMetaProperty(id, "version", "?.?.?");

    return this.getMetaProperty(id, "version_name", "v{{version}}").replace("{{version}}", version);
  };

  public download(id: string) {
    download(`${id}.js`, this.getJS(id));
  };
  public upload() {
    showFilePicker(async (file) => {
      if (!file) return;

      const text = await file.text();
      const id = Date.now().toString(36).toUpperCase();

      this._updateData((clone) => {
        clone[id] = {
          js: text,
          enabled: false
        };
      });

      this.evalPlugin(id);
    }, "js");
  };
  public new() {
    const id = Date.now().toString(36).toUpperCase();

    this._updateData((clone) => {
      clone[id] = {
        js: defaultPlugin(id),
        enabled: false
      };
    });

    this.evalPlugin(id);
  };
  public delete(id: string) {
    this.disable(id);

    this.runMethod(id, "delete");

    delete this.#evaledPlugins[id];
    delete this.#plugins[id];
    metaCache.delete(id);
  
    this._updateData((clone) => {
      delete clone[id];
    });
  };

  public getExports(id: string) {
    return this.#evaledPlugins[id];
  };

  public isEnabled(id: string) {
    if (id in this.#plugins) return this.#plugins[id].enabled;
    return false;
  };

  public keys() {
    return Object.keys(this.#plugins);
  };

  public enable(id: string) {
    if (this.#plugins[id].enabled) return;
    
    this._updateData((data) => {
      data[id].enabled = true;
    });

    this.runMethod(id, "start");
  };
  public disable(id: string) {
    if (!this.#plugins[id].enabled) return;
    
    this._updateData((data) => {
      data[id].enabled = false;
    });

    this.runMethod(id, "stop");
  };
  public toggle(id: string) {
    if (!Reflect.has(this.#plugins, id)) return;
    if (this.isEnabled(id)) return this.disable(id);
    this.enable(id);
  };

  public runMethod(id: string, name: "stop" | "start" | "delete") {
    const module = this.#evaledPlugins[id];

    try {
      if ("__esModule" in module && module.default) {
        const method = module.default[name];
        if (typeof method === "function") method();
      }
    } 
    catch (error) {
      console.warn(`[VX~Plugins]: Plugin '${this.getName(id)}' (${id}), errored while running 'module.default.${name}'`, error);
    }

    try {
      const method = module[name];
      if (typeof method === "function") method();
    } 
    catch (error) {
      console.warn(`[VX~Plugins]: Plugin '${this.getName(id)}' (${id}), errored while running 'module.${name}'`, error);
    }
  };
  getSettings(id: string): React.ComponentType | null {
    const module = this.#evaledPlugins[id];

    if ("__esModule" in module && module.default) {
      const Settings = module.default.Settings;
      if (typeof Settings === "function") return Settings;
    }

    const Settings = module.Settings;
    if (typeof Settings === "function") return Settings;

    return null;
  }

  initPlugins(timing: "document-start" | "document-idle" | "document-end" | "webpack-ready") {
    let counter = 0;
    const regex = new RegExp(`^${timing.replace("-", "(-|_)")}$`, "i");
    
    for (const key in this.#plugins) {
      if (!Object.prototype.hasOwnProperty.call(this.#plugins, key)) continue;
      
      let whenToRun = this.getMetaProperty(key, "run_at", "webpack-ready");
      if (whenToRun.toLowerCase() === "betterdiscord") whenToRun = "webpack-ready";

      if (!regex.test(whenToRun)) continue;

      this.evalPlugin(key);
      counter++;
    };

    console.log(`[VX~Plugins]: Initializing ${counter} Plugin(s) for state '${timing}'!`);
  };
}
