type AnyFunction = (this: any, ...args: any) => any;

type AnyFunctionThisParameters<T extends AnyFunction> = T extends (this: infer This, ...args: never) => any ? This : unknown;
type AnyFunctionParameters<T extends AnyFunction> = T extends (this: never, ...args: infer Arguments) => any ? Arguments : unknown[];
type AnyFunctionReturnType<T extends AnyFunction> = T extends (this: never, ...args: never) => infer ReturnValue ? ReturnValue : unknown;

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

const SET_VALUE = Symbol.for("vx.patcher.return");

interface AfterCallbackSetReturn<T> {
  [SET_VALUE]: T
};

type AfterCallback<F extends AnyFunction> = (that: AnyFunctionThisParameters<F>, args: AnyFunctionParameters<F>, result: AnyFunctionReturnType<F>) => void | AfterCallbackSetReturn<AnyFunctionReturnType<F>>;
type InsteadCallback<F extends AnyFunction> = (that: AnyFunctionThisParameters<F>, args: AnyFunctionParameters<F>, original: F) => AnyFunctionReturnType<F>;
type BeforeCallback<F extends AnyFunction> = (that: AnyFunctionThisParameters<F>, args: AnyFunctionParameters<F>) => void;

type UndoFunction = () => void;

type Hook<F extends AnyFunction> = {
  after: Set<AfterCallback<F>>,
  instead: Set<InsteadCallback<F>>,
  before: Set<BeforeCallback<F>>,
  original: F
};

const HOOK_SYMBOL = Symbol.for("vx.patcher.hook");
function hookFunction<M extends Record<PropertyKey, any>, K extends KeysMatching<M, AnyFunction>, F extends M[K]>(module: M, key: K): Hook<F> {
  const fn = module[key];

  if (HOOK_SYMBOL in fn) return fn[HOOK_SYMBOL];

  const hook: Hook<F> = {
    after: new Set(),
    instead: new Set(),
    before: new Set(),
    original: fn
  };

  function hookedFunction(this: AnyFunctionThisParameters<F>): AnyFunctionReturnType<F> {
    const args = Array.from(arguments) as AnyFunctionParameters<F>;

    for (const before of hook.before) before(this, args)

    let result: AnyFunctionReturnType<F>;
    if (!hook.instead.size) {
      result = fn.apply(this, args);
    }
    else {
      const insteadHooks = Array.from(hook.instead);
      const instead = insteadHooks.at(0)!;
      let depth = 1;

      function goDeeper(this: AnyFunctionThisParameters<F>, ...args: AnyFunctionParameters<F>): any {
        const hook = insteadHooks.at(depth++);
        if (hook) return hook(this, args, goDeeper.apply(this, args));
        return fn.apply(this, args);
      };

      result = instead(this, args, goDeeper as F);
    };

    for (const after of hook.after) {
      const res = after(this, args, result);
      if (res && SET_VALUE in res) result = res[SET_VALUE];
    };

    return result;
  };

  Object.defineProperties(hookedFunction, Object.getOwnPropertyDescriptors(fn));
  
  hookedFunction[HOOK_SYMBOL] = hook;

  const name = fn.name ? fn.name : "anonymous";

  hookedFunction.displayName = "displayName" in fn ? `VX(Patched(${fn.displayName}))` : `VX(Patched(${name}))`;
  Object.defineProperty(hookedFunction, "name", {
    value: `VX(Patched(${name}))`,
    configurable: true
  });

  hookedFunction.toString = () => fn.toString();

  module[key] = hookedFunction as F;

  return hook;
};

const patches = new WeakMap<Injector, Set<UndoFunction>>();

export class Injector {
  static afterReturn<T extends any>(value: T): AfterCallbackSetReturn<T> {
    return { [SET_VALUE]: value };
  };
  static getOriginal<T extends AnyFunction>(hooked: T): T {
    if (HOOK_SYMBOL in hooked) (hooked[HOOK_SYMBOL] as Hook<T>).original;
    return hooked;
  };

  after<M extends Record<PropertyKey, any>, K extends KeysMatching<M, AnyFunction>, F extends M[K]>(module: M, key: K, callback: AfterCallback<F>) {
    const hook = hookFunction(module, key);

    hook.after.add(callback);

    if (!patches.has(this)) patches.set(this, new Set<() => void>());
    const $patches = patches.get(this)!;
  
    function undo() {
      $patches.delete(undo);
      hook.after.delete(callback);
    };

    $patches.add(undo);
    return undo;
  };
  instead<M extends Record<PropertyKey, any>, K extends KeysMatching<M, AnyFunction>, F extends M[K]>(module: M, key: K, callback: InsteadCallback<F>) {
    const hook = hookFunction(module, key);

    hook.instead.add(callback);

    if (!patches.has(this)) patches.set(this, new Set<() => void>());
    const $patches = patches.get(this)!;
  
    function undo() {
      $patches.delete(undo);
      hook.instead.delete(callback);
    };

    $patches.add(undo);
    return undo;
  };
  before<M extends Record<PropertyKey, any>, K extends KeysMatching<M, AnyFunction>, F extends M[K]>(module: M, key: K, callback: BeforeCallback<F>) {
    const hook = hookFunction(module, key);

    hook.before.add(callback);

    if (!patches.has(this)) patches.set(this, new Set<() => void>());
    const $patches = patches.get(this)!;
  
    function undo() {
      $patches.delete(undo);
      hook.before.delete(callback);
    };

    $patches.add(undo);
    return undo;
  };
  unpatchAll() {
    if (!patches.has(this)) return;
    for (const undo of patches.get(this)!) undo();
  };
};
