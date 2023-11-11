import { ThemeData, internalDataStore } from "../../../../api/storage";
import { InternalStore, download, showFilePicker } from "../../../../util";
import { closeWindow } from "../../../../api/window";
import { waitForNode } from "common/dom";

const themeHead = document.createElement("vx-themes");

waitForNode(".drag-previewer").then(() => {
  document.body.append(themeHead, document.createElement("vx-plugins"));
});

export const themeStore = new class extends InternalStore {
  constructor() {
    super();

    const raw = internalDataStore.get("themes") ?? {};

    this.#raw = raw;

    for (const key in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        const data = raw[key];
        
        if (data.enabled) this._insertCSS(key);
      };
    };
  };

  #raw: Record<string, ThemeData>;

  _insertCSS(id: string) {
    const data = this.#raw[id];

    const style = document.createElement("style");
    style.setAttribute("data-vx-theme", id);

    const text = document.createTextNode(`${data.css}\n/*# sourceURL=vx://VX/themes/${id}.css */`);
    style.appendChild(text);

    themeHead.appendChild(style);
  };
  _clearCSS(id: string) {
    const node = themeHead.querySelector(`[data-vx-theme=${JSON.stringify(id)}]`);
    if (node) node.remove();
  };
  _updateData(callback: (clone: Record<string, ThemeData>) => void) {    
    const clone = structuredClone(this.#raw);

    callback(clone);
    
    internalDataStore.set("themes", clone);

    this.#raw = clone;
    this.emit();
  };

  keys() {
    return Object.keys(this.#raw);
  };

  download(id: string) {
    download(`${id}.vx`, `vx${JSON.stringify({
      type: "theme",
      data: {
        css: this.getCSS(id),
        name: this.getName(id)
      }
    })}`);
  }

  upload() {
    showFilePicker(async (file) => {
      if (!file) return;
  
      const text = await file.text();
  
      if (file.type === "text/css") {
        const name = file.name.replace(/\.css$/, "");
  
        this._updateData((clone) => {
          const id = Date.now().toString(36).toUpperCase();
          
          clone[id] = {
            css: text,
            enabled: false,
            name: name
          };
        });
  
        return;
      };
  
      if (!text.startsWith("vx")) return;
      
      const { type, data } = JSON.parse(text.replace("vx", ""));
  
      if (type !== "theme") return;
      
      this._updateData((clone) => {
        const id = Date.now().toString(36).toUpperCase();
        
        clone[id] = {
          css: data.css,
          enabled: false,
          name: data.name
        };
      });
    }, ".vx,.css");
  };

  new() {
    this._updateData((clone) => {
      const id = Date.now().toString(36).toUpperCase();
      
      clone[id] = {
        css: "",
        enabled: true,
        name: `New Theme - ${id}`
      };
    });
  };
  delete(id: string) {
    closeWindow(`THEME_${id}`);
    this._clearCSS(id);

    this._updateData((clone) => {
      delete clone[id];
    });
  };

  getName(id: string) {
    return this.#raw[id].name;
  };
  setName(id: string, name: string) {
    this._updateData((clone) => {
      clone[id].name = name;
    });
  };

  getCSS(id: string) {
    return this.#raw[id].css;
  };
  setCSS(id: string, css: string) {
    this._clearCSS(id);
    
    this._updateData((clone) => {
      clone[id].css = css;
    });

    if (this.isEnabled(id)) this._insertCSS(id);
  };

  enable(id: string) {
    this._insertCSS(id);

    this._updateData((clone) => {
      clone[id].enabled = true;
    });
  };
  disable(id: string) {
    this._clearCSS(id);

    this._updateData((clone) => {
      clone[id].enabled = false;
    });
  };
  isEnabled(id: string) {
    return this.#raw[id].enabled;
  };
  toggle(id: string) {
    if (!Reflect.has(this.#raw, id)) return;
    if (this.isEnabled(id)) return this.disable(id);
    this.enable(id);
  };
};