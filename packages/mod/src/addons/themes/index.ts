import { addChangeListener, plugins } from "vx:styler";
import { InternalStore, download, showFilePicker } from "../../util";
import { waitForNode } from "common/dom";
import { closeWindow } from "../../api/window";
import { openNotification } from "../../api/notifications";
import { Icons } from "../../components";
import { DataStore } from "../../api/storage";
import { getMeta, getMetaProperty } from "../meta";
import { logger } from "vx:logger";

export interface ThemeObject {
  css: string,
  name: string,
  enabled: boolean
};

type DataStoreType = Record<string, ThemeObject>;

const themeDataStore = new DataStore<DataStoreType>("VX-Themes", {
  version: 1
});

const themeHead = document.createElement("vx-themes");
waitForNode(".drag-previewer").then(() => {
  document.body.append(plugins, themeHead);
});

const destroyers = new Map<string, () => void>();

export const themeStore = new class ThemeStore extends InternalStore {
  constructor() {
    super();

    const themes = themeDataStore.getAll() as DataStoreType;
    
    this.#themes = themes;

    for (const id in themes) {
      if (Object.prototype.hasOwnProperty.call(themes, id)) {
        if (themes[id].enabled) this._insertCSS(id);
      }
    }
  }
  #themes: DataStoreType;

  public displayName = "ThemeStore";

  private _insertCSS(id: string) {
    const data = this.#themes[id];

    const style = document.createElement("style");
    style.setAttribute("data-vx-theme", id);

    style.appendChild(document.createTextNode(`${data.css}\n/*# sourceURL=vx://VX/themes/${id}.css */`));

    const undo = addChangeListener(`theme-${id}`, data.css, (css) => {
      style.innerHTML = "";

      style.appendChild(document.createTextNode(`${css}\n/*# sourceURL=vx://VX/themes/${id}.css */`));
    });

    destroyers.set(id, undo);

    themeHead.appendChild(style);
  };

  private _clearCSS(id: string) {
    if (destroyers.has(id)) destroyers.get(id)!();

    const node = themeHead.querySelector(`[data-vx-theme=${JSON.stringify(id)}]`);
    if (node) node.remove();
  };

  private _updateData(callback: (clone: Record<string, ThemeObject>) => void) {    
    const clone = structuredClone(this.#themes);

    callback(clone);
    
    themeDataStore.replace(clone);

    this.#themes = clone;
    this.emit();
  };

  public keys() {
    return Object.keys(this.#themes);
  };
  public download(id: string) {
    download(`${id}.css`, this.getCSS(id));
  };

  public getCSS(id: string) {
    return this.#themes[id].css;
  };
  public setCSS(id: string, css: string) {
    this._clearCSS(id);
    
    this._updateData((clone) => {
      clone[id].css = css;
    });

    if (this.isEnabled(id)) this._insertCSS(id);
  };
  
  public getAddonName(id: string) {
    return this.#themes[id].name;
  };
  public setName(id: string, name: string) {
    this._updateData((clone) => {
      clone[id].name = name;
    });
  };

  public new() {
    this._updateData((clone) => {
      const id = Date.now().toString(36).toUpperCase();
      
      clone[id] = {
        css: "/* Insert CSS Here */\n",
        enabled: true,
        name: `0 New Theme - ${id}`
      };
    });
  };
  public delete(id: string) {
    closeWindow(`THEME_${id}`);
    this._clearCSS(id);

    this._updateData((clone) => {
      delete clone[id];
    });
  };
  public upload() {
    const canLoadSass = typeof window.Sass === "object";

    showFilePicker(async (file) => {
      if (!file) return;
  
      const text = await file.text();

      const handleCSS = (css: string) => {
        const name = getMetaProperty(getMeta(text), "name", file.name.replace(/\.(s(a|c)|c)ss$/, ""));
  
        this._updateData((clone) => {
          const id = Date.now().toString(36).toUpperCase();
          
          clone[id] = {
            css: css,
            enabled: false,
            name
          };
        });
  
        return;
      }
  
      if (file.type === "text/css") {
        handleCSS(text);
        return;
      };
      
      if (window.Sass && /\.s(c|a)ss$/.test(file.name)) {
        window.Sass.compile(text, {
          style: window.Sass.style.nested,
          indentedSyntax: file.name.endsWith(".sass")
        }, (data) => {
          if (data.status === 1) {
            logger.warn("SASS Compiler Error", data);
            
            openNotification({
              title: "Unable To Compile Theme",
              id: "vx-unable-to-Compile",
              icon: Icons.Warn,
              type: "warn"
            });

            return;
          };
  
          handleCSS(data.text);
        });

        return;
      };

      openNotification({
        title: "Unable To Load Theme",
        id: "vx-unable-to-load",
        icon: Icons.Warn,
        type: "warn"
      });
    }, canLoadSass ? ".css,.scss,.sass" : ".css");
  };

  public enable(id: string) {
    this._insertCSS(id);

    this._updateData((clone) => {
      clone[id].enabled = true;
    });
  };
  public disable(id: string) {
    this._clearCSS(id);

    this._updateData((clone) => {
      clone[id].enabled = false;
    });
  };
  public isEnabled(id: string) {
    if (id in this.#themes) return this.#themes[id].enabled;
    return false;
  };
  public toggle(id: string) {
    if (!Reflect.has(this.#themes, id)) return;
    if (this.isEnabled(id)) return this.disable(id);
    this.enable(id);
  };

  // Public private method
  __mergeOldThemes(themes: DataStoreType) {
    themeDataStore.merge(themes);
    Object.assign(this.#themes, themes);

    for (const key in themes) {
      if (Object.prototype.hasOwnProperty.call(themes, key)) {
        const element = themes[key];
        if (element.enabled) this._insertCSS(key);
      }
    }
  }
}
