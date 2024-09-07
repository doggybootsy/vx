const __node_require__ = require;

function isURL(item: any): item is URL {
  if (item instanceof URL) return true;
  
  const url: typeof import("node:url") = __node_require__("node:url");
    
  return item instanceof url.URL
}

const fetch = globalThis.fetch;

const request: FetchRequest = async (input, init) => {
  if (typeof process === "object" && typeof document !== "object") {    
    const electron = __node_require__("electron");

    await electron.app.whenReady();

    return electron.session.defaultSession.fetch(isURL(input) ? input.href : input, init);
  }

  if (typeof document === "object" && !document.body) {
    await new Promise(r => document.addEventListener("readystatechange", () => { r(true); }))
  }
  return fetch.call(globalThis, input, init);
}

request.text = async (input, init) => {
  const res = await request(input, init);
  return { text: await res.text(), ok: res.ok, response: res };
}
request.json = async (input, init) => {
  const res = await request(input, init);
  return { json: await res.json(), ok: res.ok, response: res };
}
request.blob = async (input, init) => {
  const res = await request(input, init);
  return { blob: await res.blob(), ok: res.ok, response: res };
}
request.arrayBuffer = async (input, init) => {
  const res = await request(input, init);
  return { arrayBuffer: await res.arrayBuffer(), ok: res.ok, response: res };
}
request.formData = async (input, init) => {
  const res = await request(input, init);
  return { formData: await res.formData(), ok: res.ok, response: res };
}

function cache<T>(factory: () => T): Cache<T> {
  const value = { count: 0 } as { current: T, count: number } | { count: number };

  function cache() {
    if (value.count++ > (limit - 1)) cache.reset();
    if ("current" in value) return value.current;
    
    const current = factory();
    (value as { current: T, count: number }).current = current;

    return current;
  }

  cache.__internal__ = value;

  cache.hasValue = () => "current" in value;

  cache.reset = () => {
    // @ts-expect-error
    if ("current" in value) delete value.current;
    value.count = 0;
  };

  let limit = Infinity;
  Object.defineProperty(cache, "CALL_LIMIT", {
    get: () => limit,
    set: (v) => {
      if (typeof v !== "number" || isNaN(v) || v <= 0 || Math.round(v) !== v) {
        throw new Error("Unable to set max call threshould. Value is not a positive int");
      }

      limit = v;
      cache.reset();
    }
  })

  Object.defineProperty(cache, "get", {
    get: () => cache()
  });

  return cache as unknown as Cache<T>;
}

const __self__: Record<PropertyKey, any> = {};

export { request, cache, __self__ };