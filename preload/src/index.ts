import electron from "electron";
import fs from "node:fs";
import path from "node:path";
import console from "console";

import "preload/native";

if (/^\/vx/.test(location.pathname)) {
  const url = new URL(location.href);
  
  url.pathname = "/app";

  url.searchParams.append("vx-url", location.pathname);
  // Bad practice ik but it works
  setInterval(() => {
    location.replace(url);
  }, 10);
};

try {
  const code = fs.readFileSync(path.join(__dirname, "renderer.js"), "utf-8");

  let preExistingElement = document.querySelector("*");
  if (preExistingElement instanceof HTMLHtmlElement) throw new Error("document HTML element exists!");
  if (preExistingElement) preExistingElement.remove();

  const parent = document.createElement("vx-renderer");

  const renderer = document.createElement("script");
  renderer.innerHTML = code;
  parent.append(renderer);

  const ace = document.createElement("script");
  ace.src = "https://ajaxorg.github.io/ace-builds/src-min-noconflict/ace.js";
  parent.append(ace);

  document.append(parent);
} catch (error) {
  console.error("[VX~preload] Error while trying to load top level code", error);
}

import "preload/discordNative";

const preload = electron.ipcRenderer.sendSync("@vx/preload");
if (preload) {
  try {
    let originalRequire = require;
    if (typeof __non_webpack_require__ === "function") {
      originalRequire = __non_webpack_require__;
    };
    originalRequire(preload);
  } catch (error) {
    console.error("[VX~preload] Error while trying to load preload", error);
  };
};