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
  try {
    const url = urls.get(that as XMLHttpRequest)!;
  
    if (DISOCORD_HOST.test(url.host)) {
      const match = url.pathname.match(API);
  
      if (!match) return original.apply(that, args);
  
      const path = `/${match[1]}`;
  
      if (path === "/science" || METRIC.test(path)) {
        return;
      }
    }
  } 
  catch (error) { }

  return original.apply(that, args);
});