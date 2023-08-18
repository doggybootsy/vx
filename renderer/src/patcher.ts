type anyFN = (...args: any[]) => any;

type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

type beforePatch<fn extends anyFN> = (that: ThisParameterType<fn>, args: Parameters<fn>) => void;
type insteadPatch<fn extends anyFN> = (that: ThisParameterType<fn>, args: Parameters<fn>, original: fn) => void;
type afterPatch<fn extends anyFN> = (that: ThisParameterType<fn>, args: Parameters<fn>, result: ReturnType<fn>) => void;

const HOOK_SYMBOL = Symbol("VX.hook");

const patches = new Map<string, Set<() => void>>();

function hook(module: any, key: string | number | symbol) {
  let FN = module[key] as anyFN | void;
  if (!FN) {
    FN = () => {};
    module[key] = FN;
  };

  if (FN[HOOK_SYMBOL]) return FN[HOOK_SYMBOL] as {
    after: Set<afterPatch<anyFN>>,
    before: Set<beforePatch<anyFN>>,
    instead: Set<insteadPatch<anyFN>>,
    original: anyFN
  };

  const hook = {
    after: new Set<afterPatch<anyFN>>(),
    before: new Set<beforePatch<anyFN>>(),
    instead: new Set<insteadPatch<anyFN>>(),
    original: FN
  };

  module[key] = function() {
    let args = Array.from(arguments);

    for (const before of hook.before) before(this, args);

    let result: ReturnType<anyFN>;

    if (!hook.instead.size) {
      if (new.target) result = Reflect.construct(FN as anyFN, args, new.target);
      else result = (FN as anyFN).apply(this, args);
    }
    else {
      const insteadHooks = Array.from(hook.instead);
      const instead = insteadHooks.at(0)!;
      let depth = 1;

      function goDeeper(this: any, ...args: any[]) {
        const hook = insteadHooks.at(depth++);
        if (hook) return hook(this, args, goDeeper.apply(this, args));
        if (new.target) Reflect.construct(FN as anyFN, args, new.target);
        else (FN as anyFN).apply(this, args);
      };

      result = instead(this, args, goDeeper);
    };

    for (const after of hook.after) {
      const res = after(this, args, result);
      if (res === undefined) continue;
      result = res;
    };

    return result;
  };

  module[key][HOOK_SYMBOL] = hook;
  module[key].toString = () => hook.original.toString();

  Object.assign(module[key], hook.original);

  const displayName = (hook.original as unknown as { displayName: string | undefined }).displayName;
  module[key].displayName = displayName ? `VXPatcher(${displayName})` : "VXPatcher";

  Object.defineProperty(module[key], "name", {
    value: `VXPatcher(${hook.original.name})`,
    configurable: true
  });

  return hook;
};

export function unpatchAll(id: string) {
  if (!patches.has(id)) return;
  for (const undo of patches.get(id)!) undo();
};

export function after<module extends any, key extends KeysMatching<module, anyFN>>(id: string, module: module, key: key, callback: afterPatch<module[key]>) {
  if (id.startsWith("VX/")) id = "VX";

  const hooked = hook(module, key);

  hooked.after.add(callback);

  if (!patches.has(id)) patches.set(id, new Set<() => void>());
  const $patches = patches.get(id)!;

  $patches.add(undo);

  function undo() {
    $patches.delete(undo);
    hooked.after.delete(callback);
  };
  
  return undo;
};
// Instead the only caring about the callback?
export function instead<module extends any, key extends KeysMatching<module, anyFN>>(id: string, module: module, key: key, callback: insteadPatch<module[key]>) {
  if (id.startsWith("VX/")) id = "VX";

  const hooked = hook(module, key);

  hooked.instead.add(callback as insteadPatch<anyFN>);

  if (!patches.has(id)) patches.set(id, new Set<() => void>());
  const $patches = patches.get(id)!;

  $patches.add(undo);

  function undo() {
    $patches.delete(undo);
    hooked.instead.delete(callback as insteadPatch<anyFN>);
  };
  
  return undo;
};
export function before<module extends any, key extends KeysMatching<module, anyFN>>(id: string, module: module, key: key, callback: beforePatch<module[key]>) {
  if (id.startsWith("VX/")) id = "VX";

  const hooked = hook(module, key);

  hooked.before.add(callback);

  if (!patches.has(id)) patches.set(id, new Set<() => void>());
  const $patches = patches.get(id)!;

  $patches.add(undo);

  function undo() {
    $patches.delete(undo);
    hooked.before.delete(callback);
  };
  
  return undo;
};

export function create(id: string) {
  return {
    id: id,
    after<module extends any, key extends KeysMatching<module, anyFN>>(module: module, key: key, callback: afterPatch<module[key]>) {
      return after(id, module, key, callback);
    },
    instead<module extends any, key extends KeysMatching<module, anyFN>>(module: module, key: key, callback: insteadPatch<module[key]>) {
      return instead(id, module, key, callback);
    },
    before<module extends any, key extends KeysMatching<module, anyFN>>(module: module, key: key, callback: beforePatch<module[key]>) {
      return before(id, module, key, callback);
    },
    unpatchAll() {
      unpatchAll(id);
    }
  };
};