import electron from "electron";
import path from "node:path";
import { readFileSync } from "node:fs";
import { waitForNode } from "common/dom";
import { injectOSVars } from "common/preloads";
import { logger } from "vx:logger";

import "./native";
import "./discordnative";

waitForNode("head").then(() => {
  const script = document.createElement("script");
  script.innerHTML = readFileSync(path.join(__dirname, "build.js"), { encoding: "utf-8" });
  script.id = "vx-script";

  const style = document.createElement("style");
  style.innerHTML = readFileSync(path.join(__dirname, "build.css"), { encoding: "utf-8" });
  style.id = "vx-style";

  document.head.append(script, style);
});


injectOSVars();

try {
  require(electron.ipcRenderer.sendSync("@vx/preload"));
} catch (error) {
  logger.createChild("preload").error(error);
}
