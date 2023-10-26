import { CustomCSSData, internalDataStore } from "../../../../api/storage";
import { InternalStore, showFilePicker } from "../../../../util";
import { closeWindow } from "../../../../api/window";

export const cssHead = document.createElement("vx-custom-css");

// TODO: Make this update when / if internalDataStore is changed
export const customCSSStore = new class extends InternalStore {
  constructor() {
    super();

    const raw = internalDataStore.get("custom-css") ?? {};

    this.#raw = raw;

    for (const key in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        const data = raw[key];
        
        if (data.enabled) this._insertCSS(key);
      };
    };
  };

  #raw: Record<string, CustomCSSData>;

  _insertCSS(id: string) {
    const data = this.#raw[id];

    const style = document.createElement("style");
    style.setAttribute("data-vx-custom-css", id);

    const text = document.createTextNode(`${data.css}\n/*# sourceURL=vx://VX/custom-css/${id}.css */`);
    style.appendChild(text);

    cssHead.appendChild(style);
  };
  _clearCSS(id: string) {
    const node = cssHead.querySelector(`[data-vx-custom-css=${JSON.stringify(id)}]`);
    if (node) node.remove();
  };
  _updateData(cb: (clone: Record<string, CustomCSSData>) => void) {    
    const clone = structuredClone(this.#raw);

    cb(clone);
    
    internalDataStore.set("custom-css", clone);

    this.#raw = clone;
    this.emit();
  };

  keys() {
    return Object.keys(this.#raw);
  };

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
  
      if (type !== "custom-css") return;
      
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
        name: `New Custom CSS - ${id}`
      };
    });
  };
  delete(id: string) {
    closeWindow(`CUSTOM_CSS_${id}`);
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