import { Injector } from "../patcher";
import { FunctionType, ThisParameterType, Parameters, ReturnType } from "typings";

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

type AfterCallback<F extends FunctionType> = (that: ThisParameterType<F>, args: Parameters<F>, result: ReturnType<F>) => void | ReturnType<F>;
type InsteadCallback<F extends FunctionType> = (that: ThisParameterType<F>, args: Parameters<F>, original: F) => ReturnType<F>;
type BeforeCallback<F extends FunctionType> = (that: ThisParameterType<F>, args: Parameters<F>) => void;

export class Patcher {
  static #map: Record<string, Patcher> = {};
  public static before<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(id: string, module: M, key: K, callback: BeforeCallback<F>) {
    const patcher = Patcher.#map[id] ??= new Patcher(id);
      
    return patcher.before(module, key, callback);
  }
  public static instead<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(id: string, module: M, key: K, callback: InsteadCallback<F>) {
    const patcher = Patcher.#map[id] ??= new Patcher(id);
      
    return patcher.instead(module, key, callback);
  }
  public static after<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(id: string, module: M, key: K, callback: AfterCallback<F>) {
    const patcher = Patcher.#map[id] ??= new Patcher(id);
      
    return patcher.after(module, key, callback);
  }
  static unpatchAll(id: string) {
    const patcher = Patcher.#map[id] ??= new Patcher(id);
      
    patcher.unpatchAll();
  }
  static getPatchesByCaller(id: string) {
    const patcher = Patcher.#map[id] ??= new Patcher(id);
      
    return patcher.getPatchesByCaller();
  }

  constructor(name: string) {
    if (Patcher.#map[name]) return Patcher.#map[name];
    this.#name = name;
    Patcher.#map[name] = this;
  }

  #name!: string;
  #id = 0;
  #injector = new Injector();
  #patches = new Set<{
    callback: FunctionType,
    id: number,
    type: string,
    caller: string,
    unpatch(): void
  }>();

  public getPatchesByCaller() {
    return [...this.#patches];
  }

  public before<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(module: M, key: K, callback: BeforeCallback<F>) {
    const undo = this.#injector.before(module, key, callback);
    
    const obj = {
      callback: callback,
      id: this.#id++,
      type: "before",
      caller: this.#name,
      unpatch: () => {
        this.#patches.delete(obj);
        undo();
      }
    }

    this.#patches.add(obj);
    
    return obj.unpatch; 
  }
  public instead<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(module: M, key: K, callback: InsteadCallback<F>) {
    const undo = this.#injector.instead(module, key, callback);
    
    const obj = {
      callback: callback,
      id: this.#id++,
      type: "instead",
      caller: this.#name,
      unpatch: () => {
        this.#patches.delete(obj);
        undo();
      }
    }

    this.#patches.add(obj);
    
    return obj.unpatch; 
  }
  public after<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(module: M, key: K, callback: AfterCallback<F>) {
    function newCallback(that: ThisParameterType<F>, args: Parameters<F>, result: ReturnType<F>) {
      const res = callback(that, args, result);

      if (typeof res !== "undefined") return Injector.return(res);
    }

    const undo = this.#injector.after(module, key, newCallback);
    
    const obj = {
      callback: callback,
      id: this.#id++,
      type: "after",
      caller: this.#name,
      unpatch: () => {
        this.#patches.delete(obj);
        undo();
      }
    }
    
    this.#patches.add(obj);
    
    return obj.unpatch; 
  }
  unpatchAll() {
    for (const iterator of this.#patches) {
        iterator.unpatch();
    }
  }
}