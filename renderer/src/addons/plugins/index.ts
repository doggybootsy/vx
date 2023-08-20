import native from "renderer/native";
import Store from "renderer/store";
import { Plugin } from "renderer/addons/plugins/plugin";

export { Plugin };

const FILE_REGEX = /\.vx\.js$/;
const PLUGIN_DIRECTORY = native.path.join(native.dirname, "..", "plugins");

class PluginManager extends Store {
  #plugins = new Map<string, Plugin>();
  
  initialize() {
    if (!native.exists(PLUGIN_DIRECTORY)) native.mkdir(PLUGIN_DIRECTORY);

    const files = native.readDir(PLUGIN_DIRECTORY);

    for (const filename of files.filter((file) => FILE_REGEX.test(file))) {
      this.#plugins.set(filename, new Plugin(filename));
    }
    
    native.watch(PLUGIN_DIRECTORY, (filename, action) => {
      if (!FILE_REGEX.test(filename)) return;

      if (action === "deleted") {
        const plugin = this.#plugins.get(filename);
        if (plugin) plugin.disable();
        
        this.#plugins.delete(filename);
        this.emit();
      };
      if (action === "change") {
        this.reload(filename);
      };
    });

    this.emit();
  };
  reload(addonId: string) {
    const plugin = this.get(addonId);

    let enabled = false;
    let id: string;

    if (plugin) {
      enabled = plugin.enabled;
      plugin.disable();
      id = plugin.id;
    }
    else {
      if (!FILE_REGEX.test(addonId)) throw new TypeError(`Addon id '${addonId}' doesn't match expression '${FILE_REGEX.source}'!`);
      id = addonId;
    };

    this.#plugins.delete(id);

    const exists = native.exists(native.path.join(PLUGIN_DIRECTORY, id));

    if (!exists) return this.emit();

    const newPlugin = new Plugin(id);
    this.#plugins.set(id, newPlugin);
    if (enabled) newPlugin.enable();
    
    this.emit();
  };

  get(addonId: string) {
    for (const plugin of this.#plugins.values())
      if (plugin.is(addonId)) return plugin;
  };
  getAll() {
    return Array.from(this.#plugins.values());
  };
  enable(addonId: string) {
    const plugin = this.get(addonId);
    if (!plugin) return;
    plugin.enable();
  };
  disable(addonId: string) {
    const plugin = this.get(addonId);
    if (!plugin) return;
    plugin.disable();
  };
  toggle(addonId: string) {
    const plugin = this.get(addonId);
    if (!plugin) return;
    plugin.toggle();
  };
  isEnabled(addonId: string) {
    const plugin = this.get(addonId);
    if (!plugin) return;
    return plugin.enabled;
  };
};

const pluginManager = new PluginManager();

export default pluginManager;