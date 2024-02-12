import { FunctionType, ThisParameterType, Parameters, ReturnType } from "typings";

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

const SET_VALUE = Symbol.for("vx.patcher.return");

interface AfterCallbackSetReturn<T> {
  [SET_VALUE]: T
};

type AfterCallback<F extends FunctionType> = (that: ThisParameterType<F>, args: Parameters<F>, result: ReturnType<F>) => void | AfterCallbackSetReturn<ReturnType<F>>;
type InsteadCallback<F extends FunctionType> = (that: ThisParameterType<F>, args: Parameters<F>, original: F) => ReturnType<F>;
type BeforeCallback<F extends FunctionType> = (that: ThisParameterType<F>, args: Parameters<F>) => void;

type UndoFunction = () => void;

interface Hook<F extends FunctionType> {
  after: Set<AfterCallback<F>>,
  instead: Set<InsteadCallback<F>>,
  before: Set<BeforeCallback<F>>,
  original: F
};

function apply<T extends FunctionType>(fn: T, that: ThisParameterType<T>, args: Parameters<T>): ReturnType<T> {
  return Function.prototype.apply.call(fn, that, args);
}

const HOOK_SYMBOL = Symbol.for("vx.patcher.hook");
function hookFunction<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(module: M, key: K): Hook<F> {
  const fn = module[key];

  if (HOOK_SYMBOL in fn) return fn[HOOK_SYMBOL];

  const hook: Hook<F> = {
    after: new Set(),
    instead: new Set(),
    before: new Set(),
    original: fn
  };

  function hookedFunction(this: ThisParameterType<F>): ReturnType<F> {
    const args = Array.from(arguments) as Parameters<F>;

    for (const before of hook.before) before(this, args)

    let result: ReturnType<F>;
    if (!hook.instead.size) {
      result = apply(fn, this, args);
    }
    else {
      const insteadHooks = Array.from(hook.instead);
      const instead = insteadHooks.at(0)!;
      let depth = 1;

      function goDeeper(this: ThisParameterType<F>, ...args: Parameters<F>): any {
        const hook = insteadHooks.at(depth++);
        if (hook) return hook(this, args, goDeeper.apply(this, args));
        return apply(fn, this, args);
      };

      result = instead(this, args, goDeeper as F);
    };

    for (const after of hook.after) {
      const res = after(this, args, result);
      if (res && SET_VALUE in res) result = res[SET_VALUE];
    }

    return result;
  }

  Object.defineProperties(hookedFunction, Object.getOwnPropertyDescriptors(fn));
  
  hookedFunction[HOOK_SYMBOL] = hook;

  const name = fn.name ? fn.name : "anonymous";

  hookedFunction.displayName = "displayName" in fn ? `VXPatched(${fn.displayName})` : `VXPatched(${name})`;
  Object.defineProperty(hookedFunction, "name", {
    value: `VXPatched(${name})`,
    configurable: true
  });

  hookedFunction.toString = () => fn.toString();

  module[key] = hookedFunction as F;

  return hook;
};

const patches = new WeakMap<Injector, Set<UndoFunction>>();

export class Injector {
  public static afterReturn<T extends any>(value: T): AfterCallbackSetReturn<T> {
    return { [SET_VALUE]: value };
  }
  public static getOriginal<T extends FunctionType>(hooked: T): T {
    if (HOOK_SYMBOL in hooked) (hooked[HOOK_SYMBOL] as Hook<T>).original;
    return hooked;
  }

  public after<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(module: M, key: K, callback: AfterCallback<F>) {
    const hook = hookFunction(module, key);

    hook.after.add(callback);

    if (!patches.has(this)) patches.set(this, new Set<() => void>());
    const $patches = patches.get(this)!;
  
    function undo() {
      $patches.delete(undo);
      hook.after.delete(callback);
    }

    $patches.add(undo);
    return undo;
  }
  public instead<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(module: M, key: K, callback: InsteadCallback<F>) {
    const hook = hookFunction(module, key);

    hook.instead.add(callback);

    if (!patches.has(this)) patches.set(this, new Set<() => void>());
    const $patches = patches.get(this)!;
  
    function undo() {
      $patches.delete(undo);
      hook.instead.delete(callback);
    }

    $patches.add(undo);
    return undo;
  }
  public before<M extends Record<PropertyKey, any>, K extends KeysMatching<M, FunctionType>, F extends M[K]>(module: M, key: K, callback: BeforeCallback<F>) {
    const hook = hookFunction(module, key);

    hook.before.add(callback);

    if (!patches.has(this)) patches.set(this, new Set<() => void>());
    const $patches = patches.get(this)!;
  
    function undo() {
      $patches.delete(undo);
      hook.before.delete(callback);
    }

    $patches.add(undo);
    return undo;
  }
  public unpatchAll() {
    if (!patches.has(this)) return;
    for (const undo of patches.get(this)!) undo();
  }
};
