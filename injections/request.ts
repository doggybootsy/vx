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

export { request };