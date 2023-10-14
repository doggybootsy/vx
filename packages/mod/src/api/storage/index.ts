import { Debouncer, debounce } from "common/util";
import { InternalStore } from "../../util";
import { useStateFromStores } from "../../webpack/common";

export const { localStorage, sessionStorage } = window;

function setItem(name: string, structure: any) {
  localStorage.setItem(`VX(${name})`, JSON.stringify(structure, null, "\t"));
};

interface DataStoreOptions<T extends Record<string, any>> {
  version?: number,
  upgrader?(version: number, oldData: any): Partial<T> | void
};

export class DataStore<T extends Record<string, any> = Record<string, any>> extends InternalStore {  
  constructor(public readonly name: string, opts: DataStoreOptions<T> = {}) {
    super();

    const { version = 1, upgrader } = opts;

    const data = localStorage.getItem(`VX(${name})`);

    if (!data) {
      setItem(name, { data: {}, version });
    }
    else {
      try {
        const parsed = JSON.parse(data);
        if (parsed.version !== version) {
          const data = typeof upgrader === "function" ? upgrader(parsed.version, parsed.data) ?? {} : {};

          setItem(name, { data: data, version });
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
      set(t, p, newValue) {
        if (typeof p === "symbol") throw new TypeError("Can not set a property key with typeo 'symbol'");

        self.set(p, newValue);
        return true;
      },
      deleteProperty(t, p) {
        if (typeof p === "symbol") throw new TypeError("Can not set a property key with typeo 'symbol'");

        self.delete(p);
        return true;
      },
      defineProperty(target, property: string, attributes) {
        throw new TypeError("Can not define a property on 'DataStore.proxy'");
      }
    });

    this[Symbol.toStringTag] = `VX(${name}) - v${version}\n`;
    this.version = version;
  };

  _queueUpdate() {
    setItem(this.name, {
      data: this.#raw,
      version: this.version
    });

    this.emit();
  };
  [Symbol.toStringTag]: string = "VX(undefined) - vNaN\n";
  
  version: number;

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
    const clone = structuredClone(data);

    for (const key in clone) {
      if (clone.hasOwnProperty(key)) {
        const element = clone[key];

        this.#raw[key] = element;
      };
    };

    this._queueUpdate();
  };

  use<key extends keyof T>(key: key): T[key] {
    return useStateFromStores([ this ], () => this.get(key)!);
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
  toString() {
    const tag = this[Symbol.toStringTag];

    return tag.slice(0, tag.length - 1);
  };

  *[Symbol.iterator](): IterableIterator<[ keyof T, T[keyof T] ]> {
    yield* this.entries();
  };
};

interface InternalData {
  "enabled-plugins": string[]
};

export const internalDataStore = new DataStore<InternalData>("Internal", {
  version: 1
});