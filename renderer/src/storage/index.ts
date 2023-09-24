import native from "renderer/native";
import { fireListeners, useItem } from "renderer/storage/react";
import console from "window:console";

export const getAll = (id: string) => native.storage.getAll(id);
export const getItem = <T>(id: string, key: string, defaultValue: T) => native.storage.getItem(id, key, defaultValue);

export function setItem(id: string, key: string, value: any) {
  native.storage.setItem(id, key, value);
  fireListeners(id, key, value);
};
export function deleteItem(id: string, key: string) {
  native.storage.deleteItem(id, key);
  fireListeners(id, key, undefined);
};

export function create(id: string) {
  return {
    get<T>(key: string, defaultValue: T): T {
      return getItem(id, key, defaultValue);
    },
    getAll() {
      return getAll(id);
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

const storage = create("VX-storage");

export default storage;