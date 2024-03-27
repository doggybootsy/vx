import { addChangeListener, plugins } from "vx:styler";
import { InternalStore, createAbort, download, getDiscordTag, showFilePicker } from "../../util";
import { waitForNode } from "common/dom";
import { closeWindow } from "../../api/window";
import { DataStore } from "../../api/storage";
import { Meta, getMeta, getMetaProperty } from "../meta";
import { addons, transparency } from "../../native";
import * as css from "common/css";
import { eventNames } from "node:process";
import { UserStore } from "@webpack/common";
import { Messages } from "vx:i18n";

export interface ThemeObject {
  css: string,
  enabled: boolean
};

type DataStoreType = Record<string, ThemeObject>;

const themeHead = document.createElement("vx-themes");
waitForNode(".drag-previewer").then(() => {
  const body = document.createElement("vx-body");
  body.append(plugins, themeHead);

  document.body.append(body);
});

async function handleStyleSheet(id: string, sheet: CSSStyleSheet | null, signal: AbortSignal) {
  if (!sheet) sheet = (await waitForNode<HTMLStyleElement>(`[data-vx-theme=${JSON.stringify(id)}]`)).sheet!;
  if (signal.aborted) return;

  for (let index = 0; index < sheet.cssRules.length; index++) {
    const rule = sheet.cssRules[index];
    if (!(rule instanceof CSSMediaRule)) continue;

    const newConditionText = rule.conditionText.replace(/\(\s*transparent\s*(:\s*(["'])?(true|false|on|off|yes|no|1|0)\2\s*)?\)/g, (match, body, quote, state) => {
      let value = transparency.get();
      switch (state) {
        case "no":
        case "off":
        case "false":
        case "0":
          value = !value;
          break;
      }
      
      return css.bool(value);
    });
    
    if (newConditionText === rule.conditionText) continue;
    
    sheet.deleteRule(index);
    sheet.insertRule(rule.cssText.replace(rule.conditionText, () => newConditionText), index);
  }
}

const destroyers = new Map<string, () => void>();

const metaCache = new Map<string, Meta>();

const defaultTheme = (id: string) => {
  const user = UserStore.getCurrentUser();

  return `/**
 * @name 0 New Theme - ${id}
 * @author ${getDiscordTag(user)}
 * @authorId ${user.id}
 * @version 1.0.0
 */

/* CSS Here */
`;
};

export const themeStore = new class ThemeStore extends InternalStore {
  constructor() {
    super();

    const themes: Record<string, ThemeObject> = {};
    for (const filename of addons.themes.getAll()) {
      themes[filename] = {
        css: addons.themes.read(filename),
        enabled: addons.themes.isEnabled(filename)
      }
    }
    
    this.#themes = themes;

    for (const id in themes) {
      if (Object.prototype.hasOwnProperty.call(themes, id)) {
        if (themes[id].enabled) this._insertCSS(id);
      }
    }

    function removeTheme(this: ThemeStore, filename: string) {
      this._clearCSS(filename);

      delete this.#themes[filename];
      metaCache.delete(filename);
    }

    addons.themes.addListener((eventName, filename) => {
      switch (eventName) {
        case "add":
        case "change": {
          const enabled = addons.themes.isEnabled(filename);

          removeTheme.call(this, filename);

          const code = addons.themes.read(filename);

          const themes = {
            ...this.#themes,
            [filename]: {
              css: code,
              enabled: enabled
            }
          };

          this.#themes = themes;

          if (enabled) this._insertCSS(filename);

          this.emit();

          break;
        }
        case "unlink": {
          removeTheme.call(this, filename);
          this.emit();
          break;
        }
      }
    });
  }

  #themes: DataStoreType;

  public displayName = "ThemeStore";

  private _insertCSS(id: string) {
    const data = this.#themes[id];

    const style = document.createElement("style");
    style.setAttribute("data-vx-theme", id);

    const [ abort, getSignal ] = createAbort();

    style.appendChild(document.createTextNode(`${data.css}\n/*# sourceURL=vx://VX/themes/${id} */`));
    handleStyleSheet(id, style.sheet, getSignal());
    
    const undo = addChangeListener(`theme-${id}`, data.css, (css) => {
      abort();
      style.innerHTML = "";

      style.appendChild(document.createTextNode(`${css}\n/*# sourceURL=vx://VX/themes/${id} */`));
      handleStyleSheet(id, style.sheet, getSignal());
    });

    destroyers.set(id, () => {
      undo();
      abort();
    });

    themeHead.appendChild(style);
  }

  private _clearCSS(id: string) {
    if (destroyers.has(id)) destroyers.get(id)!();

    const node = themeHead.querySelector(`[data-vx-theme=${JSON.stringify(id)}]`);
    if (node) node.remove();
  }

  public getMeta(id: string) {
    if (metaCache.has(id)) return metaCache.get(id)!;

    const meta = getMeta(this.getCSS(id));
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
    return this.getMetaProperty(id, "name", id);
  }
  public getVersionName(id: string) {
    const version = this.getMetaProperty(id, "version", "?.?.?");

    return this.getMetaProperty(id, "version_name", "v{{version}}").replace("{{version}}", version);
  }

  public keys() {
    return Object.keys(this.#themes);
  }
  public download(id: string) {
    download(`${id}.css`, this.getCSS(id));
  }

  public getCSS(id: string) {
    return this.#themes[id].css;
  }
  public setCSS(id: string, css: string) {
    this._clearCSS(id);
    addons.themes.write(id, css);
  }

  public new() {
    const id = `${Date.now().toString(36).toUpperCase()}.css`;
    addons.themes.write(id, defaultTheme(id));
    addons.themes.setEnabledState(id, true);
  }
  public delete(id: string) {
    closeWindow(`THEME_${id}`);
    addons.themes.delete(id);
  }
  public upload() {
    showFilePicker(async (file) => {
      if (!file) return;
  
      const text = await file.text();

      const handleCSS = (css: string) => {
        const id = `${Date.now().toString(36).toUpperCase()}.css`;

        addons.themes.write(id, css);
      }
  
      handleCSS(text);
    }, ".css");
  }

  public enable(id: string) {
    this._insertCSS(id);
    addons.themes.setEnabledState(id, true);
  }
  public disable(id: string) {
    this._clearCSS(id);
    addons.themes.setEnabledState(id, false);
  }
  public isEnabled(id: string) {
    return addons.themes.isEnabled(id);
  }
  public toggle(id: string) {
    if (!Reflect.has(this.#themes, id)) return;
    if (this.isEnabled(id)) return this.disable(id);
    this.enable(id);
  }
}
