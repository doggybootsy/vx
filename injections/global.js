globalThis.console = new Proxy(globalThis.console, {
  get(console, prop, receiver) {
    const value = Reflect.get(console, prop, receiver);

    if (value instanceof Object && "__sentry_original__" in value) return value.__sentry_original__;

    return value;
  }
});

export const global = globalThis;
export const window = globalThis;