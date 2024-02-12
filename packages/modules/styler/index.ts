import { onI18nLoaded, onLocaleChange, Messages, getLoadPromise } from "vx:i18n";
import { logger } from "vx:logger";

export const plugins = document.createElement("vx-plugins");

const all = new Map<string, Styler>();
const listeners = new Map<any, Readonly<[ string, (css: string) => void ]>>();

let i18nLoaded = false;
onI18nLoaded(() => {
  getLoadPromise().then(() => { i18nLoaded = true; });

  async function changeCSS() {
    await getLoadPromise();
    for (const [ css, setCSS ] of listeners.values()) {      
      setCSS(css.replace(/{{(\w+?)}}/g, (match, message) => Messages[message]));
    }
  };

  onLocaleChange(changeCSS);

  changeCSS();
});

export function addChangeListener(id: any, css: string, callback: (css: string) => void) {
  if (i18nLoaded) {
    callback(css.replace(/{{(\w+?)}}/g, (match, message) => Messages[message]));
  }

  listeners.set(id, [ css, callback ]);

  return () => void listeners.delete(id);
}

export class Styler {  
  constructor(css: string, public readonly id: string = `Styler-${all.size}-vx`) {
    this.#css = css;
    this.#originalCSS = css;

    all.set(id, this);

    this.#undo = addChangeListener(this, css, (css: string) => {
      this.#css = css;
      if (this.#element) {
        this.#element.innerHTML = "";
        this.#element.appendChild(document.createTextNode(css));
      }
    });
  }

  #undo: () => void;
  #element: null | HTMLStyleElement = null;
  
  #originalCSS: string;
  #css: string;
  public get css() { return this.#css; }

  public replaceCSS(css: (originalCSS: string) => string) {
    const newCSS = css(this.#originalCSS);
    if (typeof newCSS !== "string") {
      logger.createChild("Styler", this.id).warn("CSS replacer function didn't return a string");
      return;
    }

    this.#undo();

    this.#undo = addChangeListener(this, newCSS, (css: string) => {
      this.#css = css;
      if (this.#element) {
        this.#element.innerHTML = "";
        this.#element.appendChild(document.createTextNode(css));
      }
    });
  }

  public add() {
    this.remove();

    const style = document.createElement("style");
    style.id = this.id;
    style.appendChild(document.createTextNode(this.css));

    this.#element = style;
    plugins.append(style);
  }
  public remove() {
    if (!this.#element) return;
    this.#element.remove();
    this.#element = null;
  }
  public enabled() {
    if (this.#element) return true;
    return false;
  }

  static getAll() {
    return all
  }
}