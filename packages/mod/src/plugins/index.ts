import { internalDataStore } from "../api/storage";
import { Developer } from "../constants";
import { PlainTextPatchType, addPlainTextPatch } from "../webpack/patches";
import { CreatedSetting } from "./settings";

export interface PluginType {
  name: string,
  description: string,
  authors: Developer[],
  patches?: PlainTextPatchType | PlainTextPatchType[],
  settings?: Record<string, CreatedSetting<any>> | React.FunctionComponent,
  start?(): void,
  stop?(): void
};

export class Plugin {
  constructor(public exports: PluginType & Record<string, any>) {
    this.name = exports.name;
    
    this.originalEnabledState = this.isEnabled();
  };

  type = <const>"plugin";

  name: string;
  public readonly originalEnabledState: boolean;

  isEnabled() {
    internalDataStore.ensure("enabled-plugins", []);
  
    const enabled = internalDataStore.get("enabled-plugins")!;
    
    return enabled.includes(this.name);
  };
  enable() {
    if (this.isEnabled()) return false;

    const enabled = internalDataStore.get("enabled-plugins")!.concat();

    enabled.push(this.name);

    internalDataStore.set("enabled-plugins", enabled);

    return true;
  };
  disable() {
    if (!this.isEnabled()) return false;

    const enabled = internalDataStore.get("enabled-plugins")!;

    const filtered = enabled.filter((name) => name !== this.name);    

    internalDataStore.set("enabled-plugins", filtered);
    
    return true;
  };
  toggle() {
    if (this.isEnabled()) {
      this.disable();
      return false;
    };

    this.enable();
    return true;
  };
};

export const plugins: Record<string, Plugin> = {};

export function definePlugin<T extends PluginType & Record<string, any>>(exports: T): T {
  const plugin = new Plugin(exports);

  const isEnabled = plugin.isEnabled();

  plugins[plugin.name] = plugin;

  if (exports.patches) {
    if (!Array.isArray(exports.patches)) exports.patches = [ exports.patches ];
    
    for (const patch of exports.patches) {
      patch._self = `window.VX.plugins[${JSON.stringify(exports.name)}].exports`;

      if (typeof patch.identifier !== "string") patch.identifier = exports.name;
      else patch.identifier = `${exports.name}(${patch.identifier})`;
    };

    if (isEnabled) addPlainTextPatch(...exports.patches);
  };

  if (isEnabled) exports.start?.();

  return exports;
};

require("@plugins");