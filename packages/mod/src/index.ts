console.log("Welcome to VX 2.0");

import "./dashboard";
import "./index.css";
import { waitForNode } from "common/dom";

import masks from "./masks.html";

import { VX } from "./window";

import { pluginStore } from "./addons/plugins";
import { whenWebpackReady } from "@webpack";
import { IS_DESKTOP } from "vx:self";

window.VX = VX;

pluginStore.initPlugins("document-start");
document.addEventListener("readystatechange", () => {
  switch (document.readyState) {
    case "complete":
      pluginStore.initPlugins("document-idle");
    case "interactive":
      pluginStore.initPlugins("document-end");
  }
});

whenWebpackReady().then(() => pluginStore.initPlugins("webpack-ready"));

waitForNode("body").then((body) => {
  const script = document.createElement("script");
  script.src = "https://medialize.github.io/sass.js/dist/sass.sync.js";
  script.id = "sass.sync.js";

  const svg = masks.querySelector("svg")!.cloneNode(true);
  body.append(script, svg);
});

const debug = new Function("/*\n\tThis is the Debugger (F8)\n\tIf you didn't mean to active it you press F8 again to leave\n\tYou get dragged to this screen because Discord disables the Debugger so VX adds a custom prollyfill\n*/\ndebugger;\n//# sourceURL=vx://VX/debugger.js");

document.addEventListener("keydown", (event) => {
  const ctrl = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (key === "f8") debug();
  if (IS_DESKTOP) {
    if (key === "f12") {
      window.VXNative!.devtools.toggle();
    }
    if (IS_DESKTOP && ctrl && event.shiftKey && key === "c") {
      window.VXNative!.devtools.enterInspectMode();
    }
  }
});