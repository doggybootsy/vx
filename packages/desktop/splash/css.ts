import { writeFileSync, readFileSync, watch } from "node:fs";
import { debounce } from "common/util";
import { getAndEnsureVXPath } from "common/preloads";

const filepath = getAndEnsureVXPath("splash.css", (path) => writeFileSync(path, ""));

function getCustomCSS() {
  return readFileSync(filepath, "binary");
};

const style = document.createElement("style");

style.id = "vx-custom-css";
style.appendChild(document.createTextNode(getCustomCSS()));

watch(
  filepath, 
  debounce(() => {
    style.innerHTML = "";
    style.appendChild(document.createTextNode(getCustomCSS()));
  }, 500)
);

export { style as customCSS };