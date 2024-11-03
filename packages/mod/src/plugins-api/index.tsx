import { internalDataStore } from "../api/storage";
import { Developer } from "../constants";
import { PlainTextPatchType, addPlainTextPatch, getLazyByKeys } from "@webpack";
import { CreatedSetting } from "./settings";
import { FluxDispatcher } from "@webpack/common";
import { logger } from "vx:logger";
import { env } from "vx:self";
import { Command } from "../api/commands/types";
import { addCommand } from "../api/commands";
import type { IconFullProps } from "../components/icons";
import { Flex } from "../components";
import * as menu from "../api/menu";
import type { MenuCallback } from "../api/menu";
import { callSafely } from "../util";
import { type Injector } from "../patcher";
import { FormattedMessage, Messages } from "vx:i18n";

export interface PluginType {
  authors: Developer[],
  icon?: React.ComponentType<IconFullProps>,
  patches?: PlainTextPatchType | PlainTextPatchType[],
  commands?: Command | Command[],
  settings?: Record<string, CreatedSetting<any>> | React.ComponentType,
  injector?: Injector,
  requiresRestart?: boolean,
  start?(signal: AbortSignal): void,
  stop?(): void,
  fluxEvents?: Record<string, (data: Record<PropertyKey, any>) => void>,
  styler?: ManagedCSS,
  menus?: Record<string, MenuCallback>
};

export type AnyPluginType = PluginType & Omit<Record<string, any>, keyof PluginType>;

const dispatcher = getLazyByKeys([ "subscribe", "dispatch" ]);

export class Plugin<T extends AnyPluginType = AnyPluginType> {
  private static __isUserPlugin?: boolean;
  private static __lastPluginId?: string;

  constructor(public readonly exports: T) {
    if (typeof Plugin.__isUserPlugin !== "boolean" || typeof Plugin.__lastPluginId !== "string" || Plugin.__lastPluginId in plugins) {
      throw new Error("Plugin was not initialized correctly, aborting!");
    }

    this.id = Plugin.__lastPluginId;

    plugins[this.id] = this;

    this.isUserPlugin = Plugin.__isUserPlugin;

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
    
    for (const eventName in exports.menus) {
      if (!Object.prototype.hasOwnProperty.call(exports.menus, eventName)) continue;

      const handler = exports.menus[eventName];
      
      menu.patch(this.id, eventName, (props, res) => {
        if (!this.getActiveState()) return;
        handler.call(null, props, res);
      });
    }

    this.authors = Array.from(new Set(exports.authors));

    if (typeof exports.settings === "object") {
      const entries = Object.entries(exports.settings);
  
      this.Settings = () => (
        <Flex direction={Flex.Direction.VERTICAL} gap={20}>
          {entries.map(([ key, setting ]) => (
            <Flex.Child key={`vx-p-s-${key}`}>
              <setting.render />
            </Flex.Child>
          ))}
        </Flex>
      );
    }
    if (typeof exports.settings === "function") this.Settings = exports.settings;

    const isEnabled = this.isEnabled();
  
    if (exports.patches) {
      if (!Array.isArray(exports.patches)) exports.patches = [ exports.patches ];
      
      for (const patch of exports.patches) {
        const self = `$vxi.plugins[${JSON.stringify(this.id)}]`;
  
        patch._self = Object.assign({}, patch._self, {
          plugin: self,
          self: `${self}.exports`,
          enabled: `${self}.getActiveState()`
        });
  
        if (typeof patch.identifier !== "string") patch.identifier = this.id;
        else patch.identifier = `${this.id}(${patch.identifier})`;
      }
      // if 'requiresRestart' is false then we can add them, because the plugin will have something incase
      if (isEnabled || !this.requiresRestart) addPlainTextPatch(...exports.patches);
    }
    if (exports.commands) {
      if (!Array.isArray(exports.commands)) exports.commands = [ exports.commands ];
  
      for (const command of exports.commands) {
        const predicate = command.predicate ?? (() => true);
  
        command.predicate = () => {
          if (this.getActiveState() && predicate()) return true;
          return false;
        }
  
        command.id = `${this.id}(${command.id})`;
  
        addCommand(command);
      }
    }
  
    if (isEnabled) {
      if (typeof exports.start === "function") callSafely(() => exports.start!(this.controller.signal), console.error);
      if (exports.styler) exports.styler.addStyle();
    }
  }

  private controller = new AbortController();

  public readonly Settings: null | React.ComponentType<{}> = null;

  public readonly authors: Developer[];

  public readonly type = "internal";

  public readonly id: string;
  public readonly isUserPlugin: boolean;

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
      if (typeof this.exports.start === "function") callSafely(() => this.exports.start!(this.controller.signal), console.error);
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
      if (typeof this.exports.stop === "function") callSafely(() => this.exports.stop!(), console.error);
      if (this.exports.styler) this.exports.styler.removeStyle();
      if (this.exports.injector) this.exports.injector.unpatchAll();
      
      this.controller.abort();
      this.controller = new AbortController();
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

  public getMetaInfo(): PluginMetaData {
    const id = this.id.replace(".app", "").replace(".web", "").replace(/-/g, "_").toUpperCase() as Uppercase<string>;
  
    let name = `${id}_NAME`;
    try {
      name = Messages[`${id}_NAME`].toString();
    } 
    catch (error) {}

    let description = "";
    try {
      let $description = Messages[`${id}_DESCRIPTION`] as string | FormattedMessage;
      if ($description instanceof FormattedMessage) description = $description.format({ }) as string;
      else description = $description;
    } 
    catch (error) {}

    name ||= `${id}_NAME`;
    description ||= `${id}_DESCRIPTION`;

    return {
      name: name,
      description: description
    }
  }

  __setMetaInfo(meta: PluginMetaData | (() => PluginMetaData)) {
    this.getMetaInfo = () => typeof meta === "function" ? meta() : meta;
  }
}

interface PluginMetaData {
  name: string;
  description: string;
}

export const plugins: Record<string, Plugin> = __self__.plugins = {};

export function definePlugin<T extends AnyPluginType>(exports: T): Plugin<T> {
  return new Plugin(exports);
}

// For use inside of plugins
export function isPluginEnabled(id: string) {  
  if (id in plugins) return plugins[id].getActiveState();
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
  require("vx:plugins/require");
  
  if (env.IS_DEV) console.log(plugins);
  
  internalDataStore.ensure("known-plugins", Object.keys(plugins));
  const known = internalDataStore.get("known-plugins")!;

  for (const id of Object.keys(plugins)) {
    if (known.includes(id)) continue;
    newPlugins.add(id);
  }
})();
