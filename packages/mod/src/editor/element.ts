export type MonacoThemes = "vs" | "vs-dark" | "hc-black" | "system-preference";
export interface EditorEvents {
  message: MessageEvent<any>,
  waiting: MessageEvent<any>,
  "value-change": MessageEvent<any>,
  ready: MessageEvent<any>
};

export function getTheme(theme: string | void | null): MonacoThemes {
  switch (theme) {
    case "light":
    case "vs":
      return "vs";

    case "dark":
    case "vs-dark":
      return "vs-dark";

    case "high-contrast":
    case "hc-black":
      return "hc-black";
  
    default:
      return "system-preference";
  };
}

const cache = new WeakMap<HTMLEditorElement, {
  postMessage(event: string, data: any): void,
  ready: boolean,
  value: string,
  theme: MonacoThemes,
  language: string,
  readonly: boolean
}>();

export function getCache(editor: HTMLEditorElement) {
  return cache.get(editor)!;
}

let index = 0;
export class HTMLEditorElement extends HTMLElement {
  constructor() {
    super();

    const theme = getTheme(this.getAttribute("theme"));

    const language = this.getAttribute("language") ?? "txt";
    const value = this.getAttribute("value") ?? "";
    
    let readonly = this.hasAttribute("readonly");

    this.addEventListener("waiting", () => {
      this.postMessage("set-options", {
        language,
        theme,
        value,
        readonly
      });
    });

    let currentValue = value;
    this.addEventListener("value-change", (event) => {
      currentValue = event.data.data; 
    });
    let ready = false;
    this.addEventListener("ready", () => { ready = true });
    let currentLang = language;
    let currentTheme = theme;

    const self = this;
    cache.set(this, {
      postMessage(event, data) {
        if (event === "update-options" || event === "set-options") {
          if (typeof data.language === "string") {
            currentLang = data.language;
            self.setAttribute("language", data.language);
          };
          if (typeof data.theme === "string") {
            data.theme = getTheme(data.theme);
            currentTheme = data.theme;
            self.setAttribute("theme", data.theme);
          };
          if (typeof data.readonly === "boolean") {
            readonly = data.readonly;
          }
        };
        
        iframe.contentWindow!.postMessage({
          id,
          to: "doggybootsy-editor",
          type: event,
          data
        }, "*");
      },
      get readonly() { return readonly },
      get ready() { return ready; },
      get value() { return currentValue; },
      get theme() { return currentTheme; },
      get language() { return currentLang; }
    });

    const id = `doggybootsy-editor-id-${index++}`;

    const shadowRoot = this.attachShadow({ mode: "open" });

    const iframe = document.createElement("iframe");
    iframe.src = "https://doggybootsy.github.io/editor/";
    iframe.setAttribute("style", "border:0px #ffffff none; width: 100%; height: 100%;");
    iframe.name = id;
    
    shadowRoot.appendChild(iframe);

    window.addEventListener("message", (event) => {
      if (event.data.source !== "doggybootsy-editor") return;
      if (event.data.id !== id) return;

      const messageEvent = new CustomEvent("message");
      // @ts-expect-error
      messageEvent.data = event.data;
      this.dispatchEvent(messageEvent);
      
      const customEvent = new CustomEvent(event.data.type);
      // @ts-expect-error
      customEvent.data = event.data;
      this.dispatchEvent(customEvent);
    });
  }

  get ready() { return cache.get(this)!.ready; };
  get language() { return cache.get(this)!.language; };
  set language(language) {
    this.postMessage("set-options", { language });
    this.postMessage("update-options", { language });
  }
  get value() { return cache.get(this)!.value; };
  set value(v) { this.setValue(v); }
  get theme() { return cache.get(this)!.theme; };
  set theme(theme) {
    this.postMessage("set-options", { theme });
    this.postMessage("update-options", { theme });
  }

  addEventListener<E extends keyof EditorEvents>(event: E, listener: (this: HTMLEditorElement, event: EditorEvents[E]) => void, options?: boolean | AddEventListenerOptions): void
  addEventListener(event: string, listener: (this: HTMLEditorElement, event: EditorEvents[keyof EditorEvents]) => void, options?: boolean | AddEventListenerOptions): void {
    // @ts-expect-error
    super.addEventListener(event, listener, options);
  }
  
  get postMessage() { return cache.get(this)!.postMessage; };

  setValue(value: string) {
    this.postMessage("set-value", { value });
  }
}

export const EDITOR_TAGNAME = "doggybootsy-editor";