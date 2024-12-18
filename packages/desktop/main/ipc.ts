import electron, {ipcMain, safeStorage} from "electron";
import {BrowserWindow} from "./window";
import {request} from "https";
import fs from "original-fs";
import path from "node:path";
import {waitFor} from "common/util";
import {KnownDevToolsPages, OpenDevToolsOptions} from "typings";
import {Storage} from "./storage";
import {getVolume, setVolume} from "./spotify";
import {adblock, alwaysPlay} from "./youtube";
// @ts-ignore
import {translate} from "deeplx";
import https from "https";
import {json} from "node:stream/consumers";

electron.ipcMain.on("@vx/preload", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;

  event.returnValue = BrowserWindow.__getPreloadFromWindow(window);
});

electron.ipcMain.handle("@vx/quit", () => {
  electron.app.quit();
});
electron.ipcMain.handle("@vx/restart", () => {
  electron.app.quit();
  electron.app.relaunch();
});

electron.ipcMain.handle("@vx/update", (event, release: Git.Release) => {
  const asar = release.assets.find((asset) => asset.name.endsWith(".asar"))!;
  
  request(asar.url, { 
    method: "GET",
    headers: {
      accept: asar.content_type,
      "user-agent": electron.session.defaultSession.getUserAgent()
    }
  }, (res) => {
    const codeIndicatesRedirect = 300 <= res.statusCode! && 400 > res.statusCode!;

    const location = res.headers.location;

    if (!(codeIndicatesRedirect && location)) return;
    
    request(location, { 
      method: "GET",
      headers: {
        accept: asar.content_type,
        "user-agent": electron.session.defaultSession.getUserAgent()
      }
    }, (res) => {
      const chunks: Buffer[] = [];
      let size = 0;

      res.on("data", (chunk) => {
        if (!Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk, "binary");

        chunks.push(chunk);
        size += chunk.length;
      });

      res.on("end", () => {
        const data = Buffer.concat(chunks, size);

        const version = release.tag_name.replace(/v/i, "");
        const asar = path.join(__dirname, "..", `${version}.asar`);
        
        fs.writeFileSync(asar, data, { encoding: "binary" });

        electron.app.quit();
        electron.app.relaunch();
      });
    }).end();
  }).end();
});

const post = (url: string, data: Record<string, unknown>): Promise<unknown> => {
  const dataString = JSON.stringify(data);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": dataString.length,
    },
    timeout: 1000, // in ms
  };
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }
      const body = [];
      res.on("data", (chunk) => body.push(chunk));
      res.on("end", () => {
        const resString = Buffer.concat(body).toString();
        resolve(resString);
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request time out"));
    });
    req.write(dataString);
    req.end();
  });
};

ipcMain.handle("@vx/webhook/send", async (event, url, jsonString) => {
  try {
    const data = JSON.parse(jsonString); // Parse the JSON string into an object

    // Now you can use the data object as needed
    const response = await post(url, data); // Use your post function here
    return response; // Return the response back to the renderer process
  } catch (error) {
    console.error("Error in webhook handler:", error);
    throw new Error("Failed to process webhook request."); // Handle error appropriately
  }
});

electron.ipcMain.handle("@vx/splash/no-close", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)!;

  Object.defineProperty(window, "close", { value: () => {} });
  Object.defineProperty(window, "hide", { value: () => {} });
});
electron.ipcMain.handle("@vx/splash/resize", (event, { width, height }) => {
  const window = BrowserWindow.fromWebContents(event.sender)!;

  window.setResizable(true);
  window.setSize(width, height, false);
  window.setResizable(false);
});

electron.ipcMain.handle("@vx/devtools/toggle", async (event, options: OpenDevToolsOptions = { }) => {
  if (event.sender.isDevToolsOpened()) {
    event.sender.closeDevTools();
    return;
  }

  event.sender.openDevTools(options as Electron.OpenDevToolsOptions);
  
  await waitFor(() => event.sender.devToolsWebContents);
  const devToolsWebContents = event.sender.devToolsWebContents!;

  if (typeof options.x === "number" && typeof options.y === "number") {
    event.sender.inspectElement(options.x, options.y);
  }
  else if (typeof options.page === "string") {
    devToolsWebContents.executeJavaScript(`try { DevToolsAPI.showPanel(${JSON.stringify(options.page)}); } catch(e) { };`);
  }
  if (typeof options.enterInspectElementMode === "boolean" && options.enterInspectElementMode) {
    devToolsWebContents.executeJavaScript("DevToolsAPI.enterInspectElementMode();");
  }
});
electron.ipcMain.handle("@vx/devtools/enter-inspect-mode", (event) => {
  if (!event.sender.isDevToolsOpened()) return;

  event.sender.devToolsWebContents!.executeJavaScript("DevToolsAPI.enterInspectElementMode();");
});
electron.ipcMain.handle("@vx/devtools/show-page", (event, page: KnownDevToolsPages) => {
  if (!event.sender.isDevToolsOpened()) return;

  event.sender.devToolsWebContents!.executeJavaScript(`try { DevToolsAPI.showPanel(${JSON.stringify(page)}); } catch(e) { };`);
});
electron.ipcMain.handle("@vx/devtools/inspect-coordinates", (event, x, y) => {
  if (!event.sender.isDevToolsOpened()) return;
  event.sender.inspectElement(x, y);
});
electron.ipcMain.on("@vx/devtools/is-open", (event) => {
  event.returnValue = event.sender.isDevToolsOpened();
});

type Path = Parameters<electron.App["getPath"]>[0];

electron.ipcMain.on("@vx/get-path", (event, path: Path) => {
  event.returnValue = electron.app.getPath(path);
});

electron.ipcMain.on("@vx/extensions/get-all", (event) => {
  event.returnValue = electron.session.defaultSession.getAllExtensions();
});

electron.ipcMain.on("@vx/transparency/get-state", (event) => {
  event.returnValue = Storage.window.get("transparent", false);
});
electron.ipcMain.handle("@vx/transparency/set-state", (event, enabled: boolean) => {
  Storage.window.set("transparent", enabled);

  electron.app.quit();
  electron.app.relaunch();
});

electron.ipcMain.on("@vx/native-frame/get-state", (event) => {
  event.returnValue = Storage.window.get("native-frame", process.platform === "darwin");
});
electron.ipcMain.handle("@vx/native-frame/set-state", (event, enabled: boolean) => {
  Storage.window.set("native-frame", enabled);

  electron.app.quit();
  electron.app.relaunch();
});

electron.ipcMain.on("@vx/safestorage/encrypt", (event, string) => {
  event.returnValue = safeStorage.encryptString(string).toString("base64");
});
electron.ipcMain.on("@vx/safestorage/decrypt", (event, encrypted) => {
  event.returnValue = safeStorage.decryptString(Buffer.from(encrypted, "base64"));
});
electron.ipcMain.on("@vx/safestorage/is-available", (event) => {  
  event.returnValue = safeStorage.isEncryptionAvailable();
});

electron.ipcMain.on("@vx/spotify-embed-volume/get", (event) => {
  event.returnValue = getVolume();
});
electron.ipcMain.handle("@vx/spotify-embed-volume/set", (event, volume) => {
  setVolume(volume);
});

electron.ipcMain.on("@vx/adblock/get", (event) => {
  event.returnValue = adblock();
});
electron.ipcMain.handle("@vx/adblock/set", (event, state) => {
  adblock(state);
});

electron.ipcMain.on("@vx/always-play/get", (event) => {
  event.returnValue = alwaysPlay();
});
electron.ipcMain.handle("@vx/always-play/set", (event, state) => {
  alwaysPlay(state);
});

ipcMain.handle("@vx/translate", async (event, [ text, to, from ]) => {
  const translatedText = from ? translate(text, to, from) : translate(text, to);
  return JSON.stringify(await translatedText);
});
