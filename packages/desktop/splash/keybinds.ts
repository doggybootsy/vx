import { getAndEnsureVXPath } from "common/preloads";
import electron from "electron";
import { writeFileSync } from "node:fs";

document.addEventListener("keydown", (event) => {  
  if (event.key.toLowerCase() === "f8") {
    debugger;
    return;
  }

  const dataKeys = process.platform === "darwin" ? event.altKey && event.metaKey : event.shiftKey && event.ctrlKey;
  
  if (event.key.toLowerCase() === "f12" || (dataKeys && event.key.toLowerCase() === "i")) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    electron.ipcRenderer.invoke("@vx/devtools/toggle", { mode: "detach" });
    return;
  }

  if (event.key.toLowerCase() === "s" && dataKeys) {
    electron.ipcRenderer.invoke("@vx/splash/no-close");
    return;
  }
  
  if (event.key.toLowerCase() === "o" && dataKeys) {
    const path = getAndEnsureVXPath("splash.css", (path) => writeFileSync(path, ""));

    electron.shell.openPath(path);
  }
});