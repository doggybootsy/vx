import { waitForNode } from "common/dom";
import { CustomCSSData, internalDataStore } from "../../../api/storage";
import { InternalStore } from "../../../util";
import { closeWindow } from "../../../api/window";

const cssHead = document.createElement("vx-custom-css");
waitForNode("head").then((head) => head.appendChild(cssHead));

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

  keys() {
    return Object.keys(this.#raw);
  };

  new() {
    const id = Date.now().toString(36).toUpperCase();
    
    const clone = structuredClone(this.#raw);

    clone[id] = {
      css: "",
      enabled: true,
      name: `New Custom CSS - ${id}`
    };

    internalDataStore.set("custom-css", clone);

    this.#raw = clone;
    this.emit();
  };
  delete(id: string) {
    closeWindow(`CUSTOM_CSS_${id}`);

    this._clearCSS(id);

    const clone = structuredClone(this.#raw);

    delete clone[id];

    internalDataStore.set("custom-css", clone);

    this.#raw = clone;
    this.emit();
  };

  getName(id: string) {
    return this.#raw[id].name;
  };
  setName(id: string, name: string) {
    const clone = structuredClone(this.#raw);

    clone[id].name = name;

    internalDataStore.set("custom-css", clone);

    this.#raw = clone;
    this.emit();
  };

  getCSS(id: string) {
    return this.#raw[id].css;
  };
  setCSS(id: string, css: string) {
    this._clearCSS(id);

    const clone = structuredClone(this.#raw);

    clone[id].css = css;

    internalDataStore.set("custom-css", clone);
    
    this.#raw = clone;
    this.emit();

    if (this.isEnabled(id)) this._insertCSS(id);
  };

  enable(id: string) {
    const clone = structuredClone(this.#raw);

    clone[id].enabled = true;
    this._insertCSS(id);

    internalDataStore.set("custom-css", clone);

    this.#raw = clone;
    this.emit();
  };
  disable(id: string) {
    const clone = structuredClone(this.#raw);

    clone[id].enabled = false;
    this._clearCSS(id);

    internalDataStore.set("custom-css", clone);

    this.#raw = clone;
    this.emit();
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