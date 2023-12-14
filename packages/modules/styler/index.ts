export const plugins = document.createElement("vx-plugins");

const all = new Map<string, Styler>();
const listeners = new Map<any, Readonly<[ string, (css: string) => void ]>>();

let i18nLoaded = false;
// VX global doesn't exist when Styler is created so
queueMicrotask(async () => {
  await window.VX.webpack.getLazy(m => m.Messages && Array.isArray(m._events.locale));
  const I18n = window.VX.webpack.common.I18n;
  i18nLoaded = true;

  async function changeCSS() {
    await I18n.loadPromise;    
    for (const [ css, setCSS ] of listeners.values()) {      
      setCSS(css.replace(/{{(\w+?)}}/g, (match, message) => I18n.Messages[message]));
    }
  };

  I18n.on("locale", changeCSS);
  changeCSS();
});

export function addChangeListener(id: any, css: string, callback: (css: string) => void) {
  if (i18nLoaded) {
    callback(css.replace(/{{(\w+?)}}/g, (match, message) => window.VX.webpack.common.I18n.Messages[message]));
  };

  listeners.set(id, [ css, callback ]);

  return () => void listeners.delete(id);
};

export class Styler {  
  constructor(css: string, public readonly id: string = `Styler-${all.size}-vx`) {
    this.#css = css;

    all.set(id, this);

    addChangeListener(this, css, (css: string) => {
      this.#css = css;
      if (this.#element) {
        this.#element.innerHTML = "";
        this.#element.appendChild(document.createTextNode(css));
      }
    });
  };

  #element: null | HTMLStyleElement = null;
  
  #css: string;
  public get css() { return this.#css; };

  public add() {
    this.remove();

    const style = document.createElement("style");
    style.id = this.id;
    style.appendChild(document.createTextNode(this.css));

    this.#element = style;
    plugins.append(style);
  };
  public remove() {
    if (!this.#element) return;
    this.#element.remove();
    this.#element = null;
  };
  public enabled() {
    if (this.#element) return true;
    return false;
  };
};