import { internalDataStore } from "../api/storage";
import { Developer } from "../constants";
import { PlainTextPatchType, addPlainTextPatch, getLazyByKeys } from "@webpack";
import { CreatedSetting } from "./settings";
import { FluxDispatcher } from "@webpack/common";
import { logger } from "vx:logger";
import { env } from "vx:self";

export interface PluginType {
  authors: Developer[],
  patches?: PlainTextPatchType | PlainTextPatchType[],
  settings?: Record<string, CreatedSetting<any>> | React.ComponentType,
  requiresRestart?: boolean,
  start?(): void,
  stop?(): void,
  fluxEvents?: Record<string, (data: Record<PropertyKey, any>) => void>,
  styler?: ManagedCSS
};

export type AnyPluginType = PluginType & Omit<Record<string, any>, keyof PluginType>;

const dispatcher = getLazyByKeys([ "subscribe", "dispatch" ]);

export class Plugin<T extends AnyPluginType = AnyPluginType> {
  constructor(public readonly exports: T) {    
    const match = new Error().stack!.match(/plugins\/(.+?)\//)!;
    this.id = match[1];

    this.requiresRestart = exports.requiresRestart ?? true;
    this.originalEnabledState = this.isEnabled();

    dispatcher.then(() => {
      if (!exports.fluxEvents) return;

      for (const eventName in exports.fluxEvents) {
        if (!Object.prototype.hasOwnProperty.call(exports.fluxEvents, eventName)) continue;

        const handler = exports.fluxEvents[eventName];
        FluxDispatcher.subscribe(eventName, (event: any) => {
          if (!this.getActiveState()) return;

          try {
            handler(event);
          } 
          catch (error) {
            logger.createChild("Plugins", "Flux").warn(`Plugin '${this.id}' errored when running Flux event '${eventName}'`, { error, handler });
          }
        });
      }
    });

    this.authors = Array.from(new Set(exports.authors));
  }

  authors: Developer[];

  type = <const>"internal";

  id: string;

  public readonly originalEnabledState: boolean;
  public readonly requiresRestart: boolean;

  public getActiveState() {
    if (this.requiresRestart) return this.originalEnabledState;
    return this.isEnabled();
  }

  public isEnabled() {
    internalDataStore.ensure("enabled-plugins", { });
  
    const enabled = internalDataStore.get("enabled-plugins")!;
    
    return enabled[this.id] === true;
  }
  public enable() {
    if (this.isEnabled()) return false;

    const enabled = structuredClone(internalDataStore.get("enabled-plugins")!);

    enabled[this.id] = true;

    internalDataStore.set("enabled-plugins", enabled);

    if (!this.requiresRestart) {
      if (typeof this.exports.start === "function") this.exports.start();
      if (this.exports.styler) this.exports.styler.addStyle();
    }

    return true;
  }
  public disable() {
    if (!this.isEnabled()) return false;

    const enabled = structuredClone(internalDataStore.get("enabled-plugins")!);

    enabled[this.id] = false;

    internalDataStore.set("enabled-plugins", enabled);

    if (!this.requiresRestart) {
      if (typeof this.exports.stop === "function") this.exports.stop();
      if (this.exports.styler) this.exports.styler.removeStyle();
    }
    
    return true;
  }
  public toggle() {
    if (this.isEnabled()) {
      this.disable();
      return false;
    }

    this.enable();
    return true;
  }
}

export const plugins: Record<string, Plugin> = __addSelf("plugins", {});

export function getPlugin(id: string) {
  for (const plugin of Object.values(plugins)) {
    if (id === plugin.id) return plugin;
  }

  return null;
}

__addSelf("getPlugin", getPlugin);

export function definePlugin<T extends AnyPluginType>(exports: T): Plugin<T> {  
  const plugin = new Plugin(exports);

  const isEnabled = plugin.isEnabled();

  plugins[plugin.id] = plugin;

  if (exports.patches) {
    if (!Array.isArray(exports.patches)) exports.patches = [ exports.patches ];
    
    for (const patch of exports.patches) {
      const self = `$vxi.getPlugin(${JSON.stringify(plugin.id)})`;

      patch._self = Object.assign({}, patch._self, {
        plugin: self,
        self: `${self}.exports`,
        enabled: `${self}.getActiveState()`
      });

      if (typeof patch.identifier !== "string") patch.identifier = plugin.id;
      else patch.identifier = `${plugin.id}(${patch.identifier})`;
    }
    // if 'requiresRestart' is false then we can add them, because the plugin will have something incase
    if (isEnabled || !plugin.requiresRestart) addPlainTextPatch(...exports.patches);
  }

  if (isEnabled) {
    if (typeof exports.start === "function") exports.start();
    if (exports.styler) exports.styler.addStyle();
  }

  return plugin;
}

// For use inside of plugins
export function isPluginEnabled(id: string) {
  const plugin = getPlugin(id);  
  if (plugin) return plugin.getActiveState();
  return false;
}

export const newPlugins = new Set<string>();

export function markPluginAsSeen(plugin: string) {
  const known = new Set(internalDataStore.get("known-plugins")!);

  newPlugins.delete(plugin);
  known.add(plugin);

  internalDataStore.set("known-plugins", [ ...known ]);
}

(function() {
  require("@plugins");
  
  if (env.IS_DEV) console.log(plugins);
  
  internalDataStore.ensure("known-plugins", Object.keys(plugins));
  const known = internalDataStore.get("known-plugins")!;

  for (const id of Object.keys(plugins)) {
    if (known.includes(id)) continue;
    newPlugins.add(id);
  }
})();