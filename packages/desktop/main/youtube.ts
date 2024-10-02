import electron from "electron";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { join } from "node:path";

let isAdblockEnabled = false;

export function adblock(): boolean
export function adblock(state: boolean): boolean
export function adblock(state?: boolean): boolean {
  if (arguments.length === 0) return isAdblockEnabled;
  if (typeof state === "boolean") return isAdblockEnabled = state!;
  return isAdblockEnabled;
}

let isAlwaysPlayEnabled = false;

export function alwaysPlay(): boolean
export function alwaysPlay(state: boolean): boolean
export function alwaysPlay(state?: boolean): boolean {
  if (arguments.length === 0) return isAlwaysPlayEnabled;
  if (typeof state === "boolean") return isAlwaysPlayEnabled = state!;
  return isAlwaysPlayEnabled;
}

const ADBLOCK_URL = "https://raw.githubusercontent.com/AdguardTeam/BlockYouTubeAdsShortcut/master/dist/index.js";

const fetchScript = cache(async () => {
  const path = join(electron.app.getPath("appData"), ".vx", "adblock.js");
  if (existsSync(path)) return fs.readFile(path, { encoding: "utf-8" });

  const res = await request.text(ADBLOCK_URL);

  await fs.writeFile(path, res.text, "utf-8");

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

      if (!allowedHostnames.includes(new URL(frame.url).hostname)) return;

      if (isAlwaysPlayEnabled) {
        frame.executeJavaScript(`
          (() => {
            function onYTConfig() {
              if (JSON.parse(ytcfg.data_.PLAYER_VARS.embedded_player_response).previewPlayabilityStatus.status !== "OK") location.reload();
            }
            if ("ytcfg" in window) onYTConfig()
            else {
              let ytcfg;
              Object.defineProperty(window, "ytcfg", {
                get: () => ytcfg,
                set(value) {
                  ytcfg = value;
                  onYTConfig();
                }
              });
            }
          })();
        `);
      }

      if (isAdblockEnabled) {
        frame.executeJavaScript(await fetchScript());
      }
    });
  });
});