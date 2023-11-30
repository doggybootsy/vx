import { writeFileSync, readFileSync } from "node:fs";
import { getAndEnsureVXPath } from "common/preloads";

const filepath = getAndEnsureVXPath("custom.js", (path) => writeFileSync(path, ""));

const script = document.createElement("script");

script.id = "vx-custom-js";
script.appendChild(document.createTextNode(readFileSync(filepath, "binary")));

export { script as customJS };