console.log("Welcome to VX 2.0");

import "./dashboard";
import "./index.css";
import { waitForNode } from "common/dom";

import masks from "./masks.html";

import { VX } from "./window";

import { pluginStore } from "./addons/plugins";
import { whenWebpackReady } from "@webpack";

window.VX = VX;

function runPlugins() {
  switch (document.readyState) {
    case "complete":
      pluginStore.initPlugins("document-idle");
      break;
    case "interactive":
      pluginStore.initPlugins("document-end");
      break;
    case "loading":
      pluginStore.initPlugins("document-start");
      break;
  }
};

document.addEventListener("readystatechange", runPlugins);

whenWebpackReady().then(() => pluginStore.initPlugins("webpack-ready"));

waitForNode("body").then((body) => {
  const script = document.createElement("script");
  script.src = "https://medialize.github.io/sass.js/dist/sass.sync.js";
  script.id = "sass.sync.js";

  const svg = masks.querySelector("svg")!.cloneNode(true);
  body.append(script, svg);
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "f8") debugger;
});
