import { writeFileSync, readFileSync, watch } from "node:fs";
import { debounce } from "common/util";
import { getAndEnsureVXPath } from "common/preloads";
import { createStyle } from "common/dom";
import { ipcRenderer } from "electron";
// import { runInNewContext } from "node:vm";

const filepath = getAndEnsureVXPath("splash.css", (path) => writeFileSync(path, ""));

function getCustomCSS() {
  return readFileSync(filepath, "utf-8");
}

const { appendTo, setCSS } = createStyle("vx-custom-css", getCustomCSS());

export function enqueAppResize() {
  const style = getComputedStyle(document.documentElement);
  
  // function getProperty(width: boolean) {
  //   let value = style.getPropertyValue(width ? "--splash-width" : "--splash-height");

  //   value = value.replace(/(\d+\s*\.\s*\d+|\d+|\.\s*\d+)\s*%/, (match, number) => (Number(number) / 100).toString());
  //   value = value.replace(/(\d+\s*\.\s*\d+|\d+|\.\s*\d+)px/, "$1");

  //   value = value.replace(/calc\((.+)\)/, (match, value) => {
  //     try {
  //       return runInNewContext(value);
  //     } catch (error) {
  //       return "0";
  //     }
  //   });

  //   if (isNaN(Number(value)) || Number(value) === 0) value = width ? "300" : process.platform === "darwin" ? "300" : "350";

  //   return Number(value);
  // }

  let width = style.getPropertyValue("--splash-width");
  if (width.endsWith("px")) width = width.replace("px", "");
  let nWidth = Number(width);
  if (isNaN(nWidth) || nWidth === 0) nWidth = 300;

  let height = style.getPropertyValue("--splash-height");
  if (height.endsWith("px")) width = width.replace("px", "");
  let nHeight = Number(height);
  if (isNaN(nHeight) || nHeight === 0) nHeight = process.platform === "darwin" ? 300 : 350;  

  ipcRenderer.invoke("@vx/splash/resize", { width: nWidth, height: nHeight });
}

watch(
  filepath, 
  debounce(() => {
    setCSS(getCustomCSS());
    enqueAppResize();
  }, 100)
);

export { appendTo };