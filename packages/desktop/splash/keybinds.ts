import { getAndEnsureVXPath } from "common/preloads";
import electron from "electron";
import { writeFileSync } from "node:fs";

document.addEventListener("keydown", (event) => {  
  if (event.key.toLowerCase() === "f8") {
    debugger;
    return;
  };
  const ctrl = event.metaKey || event.ctrlKey;

  if (event.key.toLowerCase() === "f12" || (event.key.toLowerCase() === "i" && event.shiftKey && ctrl)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    electron.ipcRenderer.invoke("@vx/splash/devtools");
    return;
  };

  if (event.key.toLowerCase() === "s" && event.shiftKey && ctrl) {
    electron.ipcRenderer.invoke("@vx/splash/no-close");
    return;
  };
  if (event.key.toLowerCase() === "o" && event.shiftKey && ctrl) {
    const path = getAndEnsureVXPath("splash.css", (path) => writeFileSync(path, ""));

    electron.shell.openPath(path);
  };
});