import { internalDataStore } from "../api/storage";
import { Developer } from "../constants";
import { PlainTextPatchType, addPlainTextPatch } from "../webpack";
import { CreatedSetting } from "./settings";

export interface PluginType {
  name: string,
  description: string,
  authors: Developer[],
  patches?: PlainTextPatchType | PlainTextPatchType[],
  settings?: Record<string, CreatedSetting<any>> | React.ComponentType,
  requiresRestart?: boolean,
  start?(): void,
  stop?(): void
};

export type AnyPluginType = PluginType & Record<string, any>;

export class Plugin<T extends AnyPluginType = AnyPluginType> {
  constructor(public readonly exports: T) {
    this.name = exports.name;
    
    this.originalEnabledState = this.isEnabled();
    this.requiresRestart = exports.requiresRestart ?? true;

    const match = new Error().stack!.match(/plugins\/(.+?)\//);
    if (match) this.id = match[1];
    else this.id = this.name;
  };

  type = <const>"internal";

  name: string;
  id: string;

  public readonly originalEnabledState: boolean;
  public readonly requiresRestart: boolean;

  public getActiveState() {
    if (this.requiresRestart) return this.originalEnabledState;
    return this.isEnabled();
  };

  public isEnabled() {
    internalDataStore.ensure("enabled-plugins", { });
  
    const enabled = internalDataStore.get("enabled-plugins")!;
    
    return enabled[this.name] === true;
  };
  public enable() {
    if (this.isEnabled()) return false;

    const enabled = structuredClone(internalDataStore.get("enabled-plugins")!);

    enabled[this.name] = true;

    internalDataStore.set("enabled-plugins", enabled);

    if (!this.requiresRestart && typeof this.exports.start === "function") this.exports.start(); 

    return true;
  };
  public disable() {
    if (!this.isEnabled()) return false;

    const enabled = structuredClone(internalDataStore.get("enabled-plugins")!);

    enabled[this.name] = false;

    internalDataStore.set("enabled-plugins", enabled);

    if (!this.requiresRestart && typeof this.exports.stop === "function") this.exports.stop(); 
    
    return true;
  };
  public toggle() {
    if (this.isEnabled()) {
      this.disable();
      return false;
    };

    this.enable();
    return true;
  };
};

export const plugins: Record<string, Plugin> = {};

export function getPlugin(nameOrId: string) {
  for (const plugin of Object.values(plugins)) {
    if (nameOrId === plugin.id || nameOrId === plugin.name) return plugin;
  }

  return null;
};

export function definePlugin<T extends AnyPluginType>(exports: T): T {
  const plugin = new Plugin(exports);

  const isEnabled = plugin.isEnabled();

  plugins[plugin.name] = plugin;

  if (exports.patches) {
    if (!Array.isArray(exports.patches)) exports.patches = [ exports.patches ];
    
    for (const patch of exports.patches) {
      const self = `window.VX._self.getPlugin(${JSON.stringify(plugin.id)})`;

      patch._self = {
        plugin: self,
        self: `${self}.exports`,
        enabled: `${self}.getActiveState()`
      };

      if (typeof patch.identifier !== "string") patch.identifier = plugin.name;
      else patch.identifier = `${plugin.name}(${patch.identifier})`;
    };
    // if 'requiresRestart' is false then we can add them, because the plugin will have something incase
    if (isEnabled || !plugin.requiresRestart) addPlainTextPatch(...exports.patches);
  };

  if (isEnabled && typeof exports.start === "function") exports.start();

  return exports;
};

// For use inside of plugins
export function isPluginEnabled(nameOrId: string) {
  const plugin = getPlugin(nameOrId);
  if (plugin) return plugin.getActiveState();
  return false;
};

require("@plugins");