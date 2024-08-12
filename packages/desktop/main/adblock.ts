import electron from "electron";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { join } from "node:path";

let isEnabled = false;

export function adblock(state?: boolean): boolean {
  if (arguments.length === 0) return isEnabled;
  if (typeof state === "boolean") return isEnabled = state!;
  return isEnabled;
}

const ADBLOCK_URL = "https://raw.githubusercontent.com/AdguardTeam/BlockYouTubeAdsShortcut/master/dist/index.js";

const fetchScript = cache(async () => {
  const path = join(electron.app.getPath("appData"), ".vx", "adblock.js");
  if (existsSync(path)) return fs.readFile(path, { encoding: "binary" });

  const res = await request.text(ADBLOCK_URL);

  await fs.writeFile(path, res.text);

  return res.text;
});

const allowedHostnames = [
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "www.youtube-nocookie.com"
];

electron.app.on("browser-window-created", (event, window) => {
  window.webContents.on("frame-created", (event, { frame }) => {
    frame.once("dom-ready", async () => {
      if (!frame?.url) return;

      if (isEnabled && allowedHostnames.includes(new URL(frame.url).hostname)) {
        frame.executeJavaScript(await fetchScript());
      }
    });
  });
});