import electron from "electron";
import { waitForNode } from "common/dom";

import logo from "./logo.html";
import { customCSS } from "./css";

import "./keybinds";
import { logger } from "vx:logger";

waitForNode("body").then((body) => {
  const clone = logo.querySelector("svg")!.cloneNode(true);
  body.appendChild(clone);

  if (electron.ipcRenderer.sendSync("@vx/transparency/get-state")) document.body.classList.add("transparent");
});

waitForNode("head").then((head) => {
  const style = document.createElement("style");
  
  style.id = "vx-logo-css";
  style.appendChild(document.createTextNode(`#vx-logo {
    position: fixed;
    bottom: 4px;
    left: 4px;
    color: rgb(148, 155, 164);
    z-index: 3000;
  }`));

  head.appendChild(style);
  head.appendChild(customCSS);
});

try {
  require(electron.ipcRenderer.sendSync("@vx/preload"));
} catch (error) {
  logger.createChild("preload").error(error);
}