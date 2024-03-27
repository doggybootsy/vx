import { Messages } from "vx:i18n";
import { DataStore } from "../../api/storage";
import { InternalStore, compileFunction, download, getDiscordTag, showFilePicker } from "../../util";
import { UserStore } from "@webpack/common";
import { Meta, getMeta, getMetaProperty } from "../meta";
import { logger } from "vx:logger";
import { vxRequire } from "../../window";
import { addons } from "../../native";

export interface PluginObject {
  js: string,
  enabled: boolean
};

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
 * @run_at webpack_ready
 */

exports.start = () => console.log("Started");
exports.stop = () => console.log("Stopped");`;
};

const hasInitedFor = {
  "webpack-ready": false,
  "document-idle": false,
  "document-end": false,
  "document-start": false
};

export const pluginStore = new class PluginStore extends InternalStore {
  constructor() {
    super();

    const plugins: Record<string, PluginObject> = {};
    for (const filename of addons.plugins.getAll()) {
      plugins[filename] = {
        js: addons.plugins.read(filename),
        enabled: addons.plugins.isEnabled(filename)
      };
    }

    this.#plugins = plugins;

    function removePlugin(this: PluginStore, filename: string) {
      this.disable(filename);
  
      this.runMethod(filename, "delete");
  
      delete this.#evaledPlugins[filename];
      delete this.#plugins[filename];
      metaCache.delete(filename);
    }

    addons.plugins.addListener((eventName, filename) => {
      switch (eventName) {
        case "add":
        case "change": {
          const enabled = addons.plugins.isEnabled(filename);          

          removePlugin.call(this, filename);

          const code = addons.plugins.read(filename);

          const plugins = {
            ...this.#plugins,
            [filename]: {
              js: code,
              enabled
            }
          };

          this.#plugins = plugins;
          this.evalPlugin(filename);

          this.emit();

          break;
        }
        case "unlink": {
          removePlugin.call(this, filename);
          this.emit();
          break;
        }
      }
    });
  }
  #plugins: Record<string, PluginObject>;
  #evaledPlugins: Record<string, PluginExports> = {};

  public displayName = "PluginStore";

  private evalPlugin(id: string) {
    const code = this.getJS(id);

    const rawModule = compileFunction<(module: PluginModule, exports: PluginExports, require: typeof vxRequire) => void>(`"use strict";\n${code}\n//# sourceURL=vx://VX/plugins/${id}.js`, [ "module", "exports", "require" ]);

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
      rawModule.call(window, module, module.exports, vxRequire);
    } 
    catch (error) {
      logger.createChild("Plugins").warn(`Plugin '${this.getAddonName(id)}' (${id}), while VX was trying to eval it\n`, error);
    }

    this.#evaledPlugins[id] = module.exports;

    loaded = true;

    if (this.isEnabled(id)) this.runMethod(id, "start");

    return module;
  }

  public getJS(id: string) {
    return this.#plugins[id].js;
  }
  public updateJS(filename: string, js: string) {
    const enabled = this.isEnabled(filename);
    
    this.disable(filename);

    this.runMethod(filename, "delete");

    delete this.#evaledPlugins[filename];
    delete this.#plugins[filename];
    metaCache.delete(filename);
    
    const plugins = {
      ...this.#plugins,
      [filename]: {
        js,
        enabled
      }
    };

    this.#plugins = plugins;
    
    addons.plugins.write(filename, js);
    this.emit();
  }

  public getMeta(id: string) {
    if (metaCache.has(id)) return metaCache.get(id)!;

    const meta = getMeta(this.getJS(id));
    metaCache.set(id, meta);

    return meta;
  }
  public getMetaProperty(id: string, key: string, defaultValue: string) {
    return getMetaProperty(this.getMeta(id), key, defaultValue);
  }
  public getAuthors(id: string) {
    return this.getMeta(id).authors ?? [];
  }
  public getAddonName(id: string) {
    return this.getMetaProperty(id, "name", Messages.UNKNOWN_NAME);
  }
  public getVersionName(id: string) {
    const version = this.getMetaProperty(id, "version", "?.?.?");

    return this.getMetaProperty(id, "version_name", "v{{version}}").replace("{{version}}", version);
  }

  public download(filename: string) {
    download(filename, this.getJS(filename));
  }
  public upload() {
    showFilePicker(async (file) => {
      if (!file) return;

      const text = await file.text();
      const filename = `${Date.now().toString(36).toUpperCase()}.vx.js`;

      const plugins = {
        ...this.#plugins,
        [filename]: {
          js: text,
          enabled: false
        }
      };
  
      this.#plugins = plugins;
      
      addons.plugins.write(filename, text);
      this.emit();
    }, "js");
  }
  public new() {
    const id = Date.now().toString(36).toUpperCase();

    const filename = `${Date.now().toString(36).toUpperCase()}.vx.js`;
    const code = defaultPlugin(id);

    const plugins = {
      ...this.#plugins,
      [filename]: {
        js: code,
        enabled: false
      }
    };

    this.#plugins = plugins;
    
    addons.plugins.write(filename, code);
    this.emit();
  }
  public delete(filename: string) {
    return addons.plugins.delete(filename);
  }

  public getExports(id: string) {
    return this.#evaledPlugins[id] ?? { };
  }

  public isEnabled(id: string) {
    if (id in this.#plugins) return this.#plugins[id]?.enabled || false;
    return false;
  }

  public keys() {
    return Object.keys(this.#plugins);
  }

  public enable(filename: string) {
    if (this.#plugins[filename]?.enabled) return;
    
    const plugins = {
      ...this.#plugins,
      [filename]: {
        js: this.#plugins[filename].js,
        enabled: true
      }
    };

    this.#plugins = plugins;
    addons.plugins.setEnabledState(filename, true);

    this.runMethod(filename, "start");
    this.emit();
  }
  public disable(filename: string) {
    if (!this.#plugins[filename]?.enabled) return;
    
    const plugins = {
      ...this.#plugins,
      [filename]: {
        js: this.#plugins[filename].js,
        enabled: false
      }
    };

    this.#plugins = plugins;
    addons.plugins.setEnabledState(filename, false);

    this.runMethod(filename, "stop");
    this.emit();
  }
  public toggle(id: string) {
    if (!Reflect.has(this.#plugins, id)) return;
    if (this.isEnabled(id)) return this.disable(id);
    this.enable(id);
  }
  public hasInitializedPlugin(id: string) {
    return id in this.#evaledPlugins;
  }

  public runMethod(id: string, name: "stop" | "start" | "delete") {
    const exports = this.getExports(id);

    try {
      if ("__esModule" in exports && exports.default) {
        const method = exports.default[name];
        if (typeof method === "function") method();
      }
    } 
    catch (error) {
      logger.createChild("Plugins").warn(`Plugin '${this.getAddonName(id)}' (${id}), errored while running 'module.default.${name}'`, error);
    }

    try {
      const method = exports[name];
      if (typeof method === "function") method();
    } 
    catch (error) {
      logger.createChild("Plugins").warn(`Plugin '${this.getAddonName(id)}' (${id}), errored while running 'module.${name}'`, error);
    }
  }
  getSettings(id: string): React.ComponentType | null {
    const exports = this.getExports(id);

    if ("__esModule" in exports && exports.default) {
      const Settings = exports.default.Settings;
      if (typeof Settings === "function") return Settings;
    }

    const Settings = exports.Settings;
    if (typeof Settings === "function") return Settings;

    return null;
  }

  initPlugins(timing: "document-start" | "document-idle" | "document-end" | "webpack-ready") {
    // Was getting weird issues where this would run multiple times?
    if (hasInitedFor[timing]) return;
    hasInitedFor[timing] = true;

    const ids: string[] = [];
    const regex = new RegExp(`^${timing.replace("-", "(-|_)")}$`, "i");
    
    for (const key in this.#plugins) {
      if (!Object.prototype.hasOwnProperty.call(this.#plugins, key)) continue;
      
      const whenToRun = this.getMetaProperty(key, "run_at", "webpack-ready");

      if (!regex.test(whenToRun)) continue;

      ids.push(key);
    };

    if (!ids.length) return;
    
    logger.createChild("Plugins").log(`Initializing ${ids.length} Plugin(s) for state '${timing}'!`);

    const then = performance.now();
    for (const id of ids) this.evalPlugin(id);

    // Only allow 2 decimal places back
    const dur = (performance.now() - then).toFixed(2);
    logger.createChild("Plugins").log("Initializing took", Number(dur), "ms");
  }
}
