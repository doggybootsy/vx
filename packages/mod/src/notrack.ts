// Disable metric and science urls

import { Injector } from "./patcher";

const injector = new Injector();

const METRIC = /^\/metrics\/v\d+$/;
const API = /^\/api\/v\d+\/(.+)$/;
const DISOCORD_HOST = /^(?:(ptb|canary)\.)?discord\.com$/;

const urls = new WeakMap<XMLHttpRequest, URL>();

injector.after(XMLHttpRequest.prototype, "open", (that, [ method, url ]) => {
  if (typeof url === "string") url = new URL(url, location.href);

  urls.set(that as XMLHttpRequest, url);
});

injector.instead(XMLHttpRequest.prototype, "send", (that, args, original) => {
  const instance = that as XMLHttpRequest;

  function fakeSend(responseText: string, status: number) {
    Object.defineProperty(instance, "result", { value: responseText });
    Object.defineProperty(instance, "responseText", { value: responseText });
    Object.defineProperty(instance, "readyState", { value: instance.DONE });
    Object.defineProperty(instance, "status", { value: status });

    instance.dispatchEvent(new ProgressEvent("loadstart"));
    instance.dispatchEvent(new ProgressEvent("loadend"));
    instance.dispatchEvent(new ProgressEvent("load"));
    instance.dispatchEvent(new Event("readystatechange"));
  }

  const send = () => original.apply(instance, args);

  try {
    const url = urls.get(instance)!;
  
    if (DISOCORD_HOST.test(url.host)) {
      if (url.pathname === "/error-reporting-proxy/web") {
        return;
      }

      const match = url.pathname.match(API);
  
      if (!match) return send();
  
      const path = `/${match[1]}`;
      if (path === "/users/vx/profile") {
        fakeSend(
          '{"message": "Invalid Form Body", "code": 50035, "errors": {"user_id": {"_errors": [{"code": "NUMBER_TYPE_COERCE", "message": "Value \"vx\" is not snowflake."}]}}}',
          404
        );

        return;
      }
  
      if (path === "/science" || METRIC.test(path)) {
        fakeSend("", 200);
        return;
      }
    }
  } 
  catch (error) { }

  return send();
});