import electron from "electron";
import path from "node:path";
import { readFileSync } from "node:fs";
import { waitForNode } from "common/dom";

import "./native";
import "./discordnative";
import { logger } from "vx:logger";

waitForNode("head").then(() => {
  const script = document.createElement("script");
  script.innerHTML = readFileSync(path.join(__dirname, "build.js"), { encoding: "binary" });
  script.id = "vx-script";

  const style = document.createElement("style");
  style.innerHTML = readFileSync(path.join(__dirname, "build.css"), { encoding: "binary" });
  style.id = "vx-style";

  document.head.append(script, style);
});

try {
  require(electron.ipcRenderer.sendSync("@vx/preload"));
} catch (error) {
  logger.createChild("preload").error(error);
}
