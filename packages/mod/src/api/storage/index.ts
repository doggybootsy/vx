import { InternalStore } from "../../util";
import { useInternalStore } from "../../hooks";
import { ThemeObject } from "../../addons/themes";
import { LocaleCodes } from "@webpack/common";

export const { localStorage, sessionStorage } = window;

function setItem(name: string, structure: any) {
  localStorage.setItem(`VX(${name})`, JSON.stringify(structure));
};

interface DataStoreOptions<T extends Record<string, any>> {
  version?: number,
  upgrader?(version: number, oldData: any): Partial<T> | void
};

const cache = new Map<string, DataStore<any>>();

export class DataStore<T extends Record<string, any> = Record<string, any>> extends InternalStore {
  constructor(public readonly name: string, opts: DataStoreOptions<T> = {}) {
    if (cache.has(name)) return cache.get(name)!;

    super();

    const { version: $version, upgrader } = opts;

    const data = localStorage.getItem(`VX(${name})`);

    if (!data) {
      setItem(name, { data: {}, version: 1 });
    }
    else {
      try {
        const parsed = JSON.parse(data)
        if (typeof $version === "number" ? parsed.version !== $version : false) {
          const data = typeof upgrader === "function" ? upgrader(parsed.version, parsed.data) ?? {} : {};

          setItem(name, { data: data, version: $version });
        }
        else if (!("version" in parsed || "data" in parsed)) {
          setItem(name, { data: {}, version: $version ?? 1 });
        };
      } 
      catch (error) {
        console.error(`[vx] Error reading data for '${name}'`, error);
        setItem(name, { data: {}, version: $version ?? 1 });
      };
    };

    const raw = JSON.parse(localStorage.getItem(`VX(${name})`)!);
    
    this.#raw = raw.data;

    const self = this;
    const proxy = new Proxy(this.#raw, {
      set(t, p, newValue) {
        if (typeof p !== "string") throw new TypeError(`Can not set a property key with typeof '${typeof p}'`);

        self.set(p, newValue);
        return true;
      },
      deleteProperty(t, p) {
        if (typeof p !== "string") throw new TypeError(`Can not delete a property key with typeof '${typeof p}'`);

        self.delete(p);
        return true;
      },
      defineProperty(target, property, attributes) {
        throw new TypeError("Can not define a property on 'DataStore.proxy'");
      }
    });

    Object.defineProperty(this, "proxy", {
      get() { return proxy },
      set(v: Partial<T>) {
        self.replace(v);

        return true;
      }
    });

    const version = $version ?? raw.version;
    this[Symbol.toStringTag] = `VX(${name}) - v${version}\n`;
    this.version = version;

    this.displayName = this.toString();

    cache.set(name, this);
  };

  _queueUpdate() {
    setItem(this.name, {
      data: this.#raw,
      version: this.version
    });

    this.emit();
  };
  [Symbol.toStringTag]: string = "VX(undefined) - vNaN\n";
  
  version!: number;

  #raw!: Partial<T>;
  proxy!: Partial<T>;

  clear() {
    for (const key in this.#raw) {
      if (Object.prototype.hasOwnProperty.call(this.#raw, key)) {
        delete this.#raw[key];
      };
    };

    this._queueUpdate();
  };
  delete(key: keyof T) {
    delete this.#raw[key];

    this._queueUpdate();
  };
  get<key extends keyof T>(key: key): T[key] | void {
    return this.#raw[key];
  };
  set<key extends keyof T>(key: key, value: T[key]) {
    this.#raw[key] = value;

    this._queueUpdate();
  };
  has(key: keyof T) {
    return key in this.#raw;
  };
  getAll(): Partial<T> {
    return structuredClone(this.#raw);
  };

  use<K extends keyof T>(key: K): T[K] | void {
    return useInternalStore(this, () => this.get(key));
  };

  entries(): [ keyof T, T[keyof T] ][] {
    return Object.entries(this.getAll());
  };
  keys(): Array<keyof T> {
    return Object.keys(this.getAll());
  };

  merge(data: Partial<T>): void {
    const clone = structuredClone(data);

    for (const key in clone) {
      if (Object.prototype.hasOwnProperty.call(clone, key)) {
        const element = clone[key];

        this.#raw[key] = element;
      };
    };

    this._queueUpdate();
  };
  replace(data: Partial<T>): void {
    const clone = structuredClone(data);

    for (const key in this.#raw) {
      if (Object.prototype.hasOwnProperty.call(this.#raw, key)) {
        delete this.#raw[key];
      }
    }
    
    for (const key in clone) {
      if (Object.prototype.hasOwnProperty.call(clone, key)) {
        const element = clone[key];

        this.#raw[key] = element;
      };
    };

    this._queueUpdate();
  }

  ensure<key extends keyof T>(key: key, value: T[key]) {
    if (this.has(key)) return false;
    this.set(key, value);
    return true;
  };

  toJSON() {
    return {
      version: this.version,
      name: this.name,
      data: this.getAll(),
      __type: "vx.storage.datastore"
    };
  };
  toString() {
    return `VX(${this.name}) - v${this.version}`;
  };

  *[Symbol.iterator](): IterableIterator<[ keyof T, T[keyof T] ]> {
    yield* this.entries();
  };
};

interface InternalData {
  "enabled-plugins": Record<string, boolean>,
  "content-protection": boolean,
  "user-setting-shortcut": boolean,
  "preserve-query": boolean,
  "show-favicon": boolean,
  "last-loaded-locale": LocaleCodes
};

export const internalDataStore = new DataStore<InternalData>("Internal", {
  version: 7,
  upgrader(version, oldData) {
    switch (version) {
      case 6: {
        if ("themes" in oldData) {
          import("../../addons/themes/index.js").then(({ themeStore }) => {
            themeStore.__mergeOldThemes(oldData.themes);
          });
        }

        return oldData;
      };
    
      default:
        console.log("[VX~DataStore~internal]: Unknown Version handler for version:", version);
    };
  },
});