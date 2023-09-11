import { AddonMeta } from "common";
import native from "renderer/native";
import { getItem, setItem } from "renderer/storage";
import Store from "renderer/store";
import { readMeta } from "renderer/addons/common";
import { PluginModule, PluginExports } from "renderer/addons/plugins/types";

const PLUGIN_DIRECTORY = native.path.join(native.dirname, "..", "plugins");

function saveEnabledState(addonId: string, enabled: boolean) {
  let enabledPlugins = new Set<string>(getItem("vx", "enabled-plugins", [ ]));

  if (enabled) enabledPlugins.add(addonId);
  else enabledPlugins.delete(addonId);

  setItem("vx", "enabled-plugins", Array.from(enabledPlugins));
};

export class Plugin extends Store {
  #module: PluginModule;
  #meta: AddonMeta;

  #didError = false;
  #contents: string;
  #exports: PluginExports;
  #enabled: boolean = false;
  #initializedTimeStamp = Date.now().toString(32);

  get type() { return <const>"plugin"; };

  get meta() {
    if (!Object.isFrozen(this.#meta)) Object.freeze(this.#meta); 
    return this.#meta;
  };
  get id() { return this.#module.id; };
  get didError() { return this.#didError; };
  get exports() { return this.#exports; };
  get filepath() { return native.path.join(PLUGIN_DIRECTORY, this.id); };
  get contents() { return this.#contents; };
  get initializedTimeStamp() { return this.#initializedTimeStamp; };

  constructor(file: string) {
    super();

    const enabledPlugins = getItem("vx", "enabled-plugins", [ ] as string[]);

    const enabled = enabledPlugins.includes(file);

    const data = native.readFile(native.path.join(PLUGIN_DIRECTORY, file));
    this.#contents = data;

    const meta = readMeta(data);
    this.#meta = meta;

    const self = this;
    const module: PluginModule = {
      loaded: false,
      meta,
      exports: {},
      id: file,
      get enabled() { return self.enabled; }
    };

    this.#module = module;
    
    try {
      const fn = new Function("module", "exports", `${data}\n//# sourceURL=vx://VX/plugins/${file}`);

      fn.call(window, module, module.exports);

      module.loaded = true;
    } 
    catch (error) {
      this.#didError = true;
      console.error(`Error loading plugin '${file}'`, error);
    };
    
    if ("__esModule" in module.exports && module.exports.__esModule && module.exports.default) this.#exports = module.exports.default;
    else this.#exports = module.exports;

    if (!this.#didError && enabled) this.enable();
  };

  is(addonId: string) {
    if (this.#meta.name === addonId) return true;
    if (this.id === addonId) return true;
    return false;
  };
  enable() {
    if (this.#enabled) return;
    this.#enabled = true;
    saveEnabledState(this.id, true);
    if (typeof this.#exports.start === "function") this.#exports.start();
    this.emit();
  };
  disable() {
    if (!this.#enabled) return;
    this.#enabled = false;
    saveEnabledState(this.id, false);
    if (typeof this.#exports.stop === "function") this.#exports.stop();
    this.emit();
  };
  toggle() {
    if (this.#enabled) this.disable();
    else this.enable();
  };
  get enabled() { return this.#enabled; };
};