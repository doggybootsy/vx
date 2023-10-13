import { Debouncer, debounce } from "common/util";
import { InternalStore } from "../../util";
import { useStateFromStores } from "../../webpack/common";

export const { localStorage, sessionStorage } = window;

function setItem(name: string, structure: any) {
  localStorage.setItem(`VX(${name})`, JSON.stringify(structure, null, "\t"));
};

export class DataStore<T extends Record<string, any> = Record<string, any>> extends InternalStore {
  constructor(public readonly name: string, public readonly version = 1) {
    super();

    const data = localStorage.getItem(`VX(${name})`);

    if (!data) {
      setItem(name, { data: {}, version });
    }
    else {
      try {
        const parsed = JSON.parse(data);
        if (parsed.version !== version) {
          setItem(name, { data: {}, version });
        }
        else if (!("version" in parsed || "data" in parsed)) {
          setItem(name, { data: {}, version });
        };
      } 
      catch (error) {
        console.error(`[vx] Error reading data for '${name}'`, error);
        setItem(name, { data: {}, version });
      };
    };

    this.#raw = JSON.parse(localStorage.getItem(`VX(${name})`)!).data;

    const self = this;
    this.proxy = new Proxy(this.#raw, {
      set(t, p: string, newValue) {
        self.set(p, newValue);
        return true;
      },
      deleteProperty(t, p: string) {
        self.delete(p);
        return true;
      },
    });

    this[Symbol.toStringTag] = `VX(${name})\n`;
  };

  _queueUpdate() {
    setItem(this.name, {
      data: this.#raw,
      version: this.version
    });

    this.emit();
  };
  [Symbol.toStringTag]: string = "VX(undefined)\n";

  #raw: Partial<T>;
  proxy: Partial<T>;
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

  entries(): [ keyof T, T[keyof T] ][] {
    return Object.entries(this.getAll());
  };

  merge(data: Partial<T>): void {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];

        this.#raw[key] = element;
      };
    };

    this._queueUpdate();
  };

  use<key extends keyof T>(key: key): T[key] | void
  use(key: void): Partial<T>
  use<key extends keyof T>(key?: key): Partial<T> | T[key] | void {
    if (typeof key === "undefined") return useStateFromStores([ this ], () => this.getAll());
    return useStateFromStores([ this ], () => this.get(key!));
  };

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

  *[Symbol.iterator](): IterableIterator<[ keyof T, T[keyof T] ]> {
    yield* this.entries();
  };
};

export const internalDataStore = new DataStore<{
  "enabled-plugins": string[]
}>("Internal", 1);