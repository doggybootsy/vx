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

  if (!document.body) {
    await new Promise(r => document.addEventListener("readystatechange", () => { r(true); }))
  }
  return fetch.call(window, input, init);
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
  const value = { } as { current: T } | { };

  function cache() {
    if ("current" in value) return value.current;
    
    const current = factory();
    (value as { current: T }).current = current;

    return current;
  }

  cache.__internal__ = value;

  cache.hasValue = () => "current" in value;

  cache.reset = () => {
    // @ts-expect-error
    if ("current" in value) delete value.current;
  };

  Object.defineProperty(cache, "get", {
    get: () => cache()
  });

  return cache as unknown as Cache<T>;
}

function __addSelf<T>(key: string, value: T): T {
  __addSelf.__self__[key] = value;
  return value;
}
__addSelf.__self__ = {} as Record<string, any>;

export { request, cache, __addSelf };