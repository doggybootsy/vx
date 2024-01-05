import { waitForElementRemoved } from "common/dom";
import { getProxyStore } from "@webpack";
import { HTMLEditorElement, EDITOR_TAGNAME, getCache } from "./element";

customElements.define(EDITOR_TAGNAME, HTMLEditorElement);

interface EditorEvents {
  change: string,
  ready: {},
  waiting: {}
};

type Listener<K extends keyof EditorEvents> = (data: EditorEvents[K]) => void;

const cache = new WeakMap<Editor, ReturnType<typeof getCache>>();

const ThemeStore = getProxyStore("ThemeStore");

export class Editor {
  constructor(element: Element, language: string, value: string, options: { readonly?: boolean } = {}) {    
    element.innerHTML = "";

    const editorElement = document.createElement(EDITOR_TAGNAME) as HTMLEditorElement;
    
    const self = getCache(editorElement);
    cache.set(this, self);
  
    // @ts-expect-error
    element.append(editorElement);

    function setOptions(options: Record<string, any>) {
      self.postMessage("set-options", options);
      self.postMessage("update-options", options);

      setTimeout(() => {
        self.postMessage("set-options", options);
        self.postMessage("update-options", options);
      }, 50);
    };

    editorElement.addEventListener("waiting", () => {
      setOptions({
        value, 
        language, 
        theme: ThemeStore.theme,
        readonly: Boolean(options.readonly)
      });
    });

    editorElement.addEventListener("message", (event) => {
      let type = event.data.type;

      if (type === "value-change") type = "change";

      if (!this.#listeners.has(type)) return;

      for (const listener of this.#listeners.get(type)!) {
        listener(event.data.data);
      };
    });

    function listener() {
      setOptions({ theme: ThemeStore.theme });
    };
    ThemeStore.addChangeListener(listener);
    waitForElementRemoved(element).then(() => {
      ThemeStore.removeChangeListener(listener);
    });
  };

  get value() { return cache.get(this)!.value; };
  set value(v) { this.setValue(v); }

  get language() { return cache.get(this)!.language; };
  set language(language) {
    this.postMessage("set-options", { language });
    this.postMessage("update-options", { language });
  };

  get readonly() { return cache.get(this)!.readonly; };
  set readonly(readonly) {
    this.postMessage("set-options", { readonly });
    this.postMessage("update-options", { readonly });
  };

  get ready() { return cache.get(this)!.ready; };

  get theme() { return cache.get(this)!.theme; };
  set theme(theme) {
    this.postMessage("set-options", { theme });
    this.postMessage("update-options", { theme });
  };
  
  setValue(value: string) {
    this.postMessage("set-value", { value });
  };

  get postMessage() { return cache.get(this)!.postMessage; };

  #listeners = new Map<keyof EditorEvents, Set<(data: any) => void>>();
  on<K extends keyof EditorEvents>(event: K, cb: Listener<K>) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());

    this.#listeners.get(event)!.add(cb);
  };
  once<K extends keyof EditorEvents>(event: K, cb: Listener<K>) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());

    const listeners = this.#listeners.get(event)!;
    function listener(data: EditorEvents[K]) {
      listeners.delete(listener);
      cb(data);
    };

    listeners.add(listener);
  };
  off<K extends keyof EditorEvents>(event: K, cb: Listener<K>) {
    if (!this.#listeners.has(event)) return;
    
    this.#listeners.get(event)!.delete(cb);
  };
};