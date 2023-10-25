import { waitForNode } from "common/dom";
import { themes } from "../native";
import { internalDataStore } from "../api/storage";
import { AddonMeta, readMeta } from "./meta";
import { cssHead } from "../dashboard/pages/customCSS/store";
import { InternalStore } from "../util";

const vxHead = document.createElement("vx-head");

const themesHead = document.createElement("vx-themes");
vxHead.append(
  document.createElement("vx-plugins"), 
  themesHead,
  cssHead
);

waitForNode("head").then((head) => head.append(vxHead));

export class Theme {
  constructor(filename: string, contents: string) {
    this.meta = readMeta(contents);
    this.contents = contents;
    this.id = filename;

    if (this.isEnabled()) {
      this._addStyle();
    };
  };
  id: string;
  meta: AddonMeta;
  contents: string;

  type = <const>"theme";

  _removeStyle() {
    const node = themesHead.querySelector(`[data-vx-filename=${JSON.stringify(this.id)}]`);
    if (node) node.remove();
  };
  _addStyle() {
    const style = document.createElement("style");
    style.setAttribute("data-vx-filename", this.id);

    const text = document.createTextNode(`${this.contents}\n/*# sourceURL=vx://VX/themes/${this.id} */`);
    style.appendChild(text);

    themesHead.appendChild(style);
  };

  isEnabled() {
    internalDataStore.ensure("enabled-themes", []);
  
    const enabled = internalDataStore.get("enabled-themes")!;
    
    return enabled.includes(this.id);
  };
  
  enable() {
    this._removeStyle();
    this._addStyle();

    const enabled = new Set(internalDataStore.get("enabled-themes")!);
    enabled.add(this.id);
    internalDataStore.set("enabled-themes", Array.from(enabled));
  };
  disable() {
    this._removeStyle();

    const enabled = internalDataStore.get("enabled-themes")!;
    const filtered = enabled.filter((name) => name !== this.id);
    internalDataStore.set("enabled-themes", filtered);
  };
  toggle() {
    if (this.isEnabled()) {
      this.disable();
      return false;
    };

    this.enable();
    return true;
  };
  async delete() {    
    await themes.delete(this.id);

    this.disable();

    delete themeStore.themes[this.id];
    themeStore.emit();
  };
};

export const themeStore = new class extends InternalStore {
  constructor() {
    super();

    this.loadThemes();
  };

  async loadThemes() {
    for (const key in this.themes) {
      if (Object.prototype.hasOwnProperty.call(this.themes, key)) {
        const theme = this.themes[key];
        
        theme._removeStyle();
      };
    };

    this.themes = {};

    this.emit();

    const allThemes = await themes.getAll();

    for (const key in allThemes) {
      if (Object.prototype.hasOwnProperty.call(allThemes, key)) {
        const element = allThemes[key];

        this.themes[key] = new Theme(key, element);
      };
    };

    this.emit();
  };

  themes: Record<string, Theme> = {};
};