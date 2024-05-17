import { writeFileSync, readFileSync, watch } from "node:fs";
import { debounce } from "common/util";
import { getAndEnsureVXPath } from "common/preloads";
import { createStyle } from "common/dom";

const filepath = getAndEnsureVXPath("splash.css", (path) => writeFileSync(path, ""));

function getCustomCSS() {
  return readFileSync(filepath, "binary");
}

const { appendTo, setCSS } = createStyle("vx-custom-css", getCustomCSS());

watch(
  filepath, 
  debounce(() => {
    setCSS(getCustomCSS());
  }, 100)
);

export { appendTo };