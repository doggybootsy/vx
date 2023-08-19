import native from "renderer/native";
import { fireListeners, useItem } from "renderer/storage/react";
import console from "console";

const STORAGE_DIRECTORY = native.path.join(native.dirname, "..", "storage");
if (!native.exists(STORAGE_DIRECTORY)) native.mkdir(STORAGE_DIRECTORY);

const cache = new Map<string, Record<string, any>>();
export function getData(id: string) {
  if (cache.has(id)) return cache.get(id)!;

  const path = native.path.join(STORAGE_DIRECTORY, `${id}.vx`);
  if (!native.exists(path)) native.writeFile(path, "{}");
  let data: Record<string, any>;
  try {
    const json = native.readFile(path);
    data = JSON.parse(json);
  } catch (error) {
    console.warn(`Error loading '${id}' data. \nError:`, error);
    data = { };
  };

  cache.set(id, data);

  return data;
};

export function getItem<T>(id: string, key: string, defaultValue: T): T {
  const data = getData(id);
  return key in data ? data[key] : defaultValue;
};
export function setItem(id: string, key: string, newValue: any) {
  const data = getData(id);
  const path = native.path.join(STORAGE_DIRECTORY, `${id}.vx`);

  data[key] = newValue;

  native.writeFile(path, JSON.stringify(data, null));

  fireListeners(id, key, newValue);
};
export function deleteItem(id: string, key: string) {
  const data = getData(id);
  const path = native.path.join(STORAGE_DIRECTORY, `${id}.vx`);

  delete data[key];
  
  native.writeFile(path, JSON.stringify(data, null));

  fireListeners(id, key, undefined);
};

export function create(id: string) {
  return {
    get<T>(key: string, defaultValue: T): T {
      return getItem(id, key, defaultValue);
    },
    getAll() {
      return getData(id);
    },
    use<T>(key: string, defaultValue: T): T {
      return useItem(id, key, defaultValue);
    },
    set(key: string, value: any) {
      setItem(id, key, value);
    },
    delete(key: string) {
      deleteItem(id, key);
    }
  };
};

export { useItem } from "./react";

const storage = create("VX");

export default storage;