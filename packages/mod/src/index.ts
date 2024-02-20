import "./dashboard";
import "./index.css";
import { waitForNode } from "common/dom";

import masks from "./masks.html";

import { VX } from "./window";

import { pluginStore } from "./addons/plugins";
import { whenWebpackInit } from "@webpack";
import { IS_DESKTOP, env } from "vx:self";
import { transparency } from "./native";

console.log(`Welcome to VX v${env.VERSION}`);

// fetch('https://media0.giphy.com/media/3og0IFrHkIglEOg8Ba/giphy.gif', {
//   cache: "force-cache"
// }).then(async response =>{
//   var reader = new FileReader() ;
//   reader.onload = () => {
//     console.log(
//       "%c %cvx", 
//       `background-image: url("${reader.result}");background-size: 44px; background-repeat: no-repeat;background-size:fill;padding:14px 18px;border-radius:8px;`,
//       `background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='white' d='M51.4697 27.0801L38.96 74.6582L22.0068 75.6152L6.62598 27.5586L22.8271 26.0547L29.3896 54.082L35.7471 26.0547L51.4697 27.0801ZM93.75 27.0801L80.4199 50.2539L91.7676 70.4199L77.4805 74.8633L71.3281 60.918L64.082 74.9316L49.3164 69.5996L61.8945 49.7754L50.4102 28.9258L66.0645 25.166L71.6699 38.9062L77.6172 25.166L93.75 27.0801Z'%3E%3C/path%3E%3C/svg%3E");background-size: 30px; background-repeat: no-repeat;padding:7px 12px 7px 7px;color:transparent;margin-left:-36px`, 
//       `Welcome To VX ${env.VERSION}`
//     );
//   } ;
//   reader.readAsDataURL(await response.blob()) ;
// });

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

whenWebpackInit().then(() => pluginStore.initPlugins("webpack-ready"));

waitForNode("body").then((body) => {
  const script = document.createElement("script");
  script.src = "https://medialize.github.io/sass.js/dist/sass.sync.js";
  script.id = "sass.sync.js";

  const svg = masks.querySelector("svg")!.cloneNode(true);
  body.append(script, svg);

  body.classList.add("vx");
  if (transparency.get()) body.classList.add("transparent");
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
    if (ctrl && event.shiftKey && key === "c") {
      window.VXNative!.devtools.enterInspectMode();
    }
  }
});
