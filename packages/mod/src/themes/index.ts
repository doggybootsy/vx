import { waitForNode } from "common/dom";
import { themes } from "../native";
import { internalDataStore } from "../api/storage";
import { AddonMeta, readMeta } from "./meta";

const themesHead = document.createElement("vx-themes");
waitForNode("head").then((head) => head.appendChild(themesHead));

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
  delete() {
    delete themeStore.themes[this.id];
    this.disable();

    return themes.delete(this.id);
  };
};

export const themeStore = new class ThemeStore {
  constructor() {
    themes.getAll().then((themes) => {
      for (const key in themes) {
        if (Object.prototype.hasOwnProperty.call(themes, key)) {
          const element = themes[key];
          
          this.themes[key] = new Theme(key, element);
        }
      }
    });
  };

  themes: Record<string, Theme> = {};
};