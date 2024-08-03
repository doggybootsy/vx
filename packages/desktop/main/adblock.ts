import electron from "electron";

let isEnabled = false;

export function adblock(state?: boolean): boolean {
  if (arguments.length === 0) return isEnabled;
  if (typeof state === "boolean") return isEnabled = state!;
  return isEnabled;
}

function fetchScript() {
  if (fetchScript._fetch) return fetchScript._fetch;

  async function getScript() {
    return (await request.text("https://raw.githubusercontent.com/AdguardTeam/BlockYouTubeAdsShortcut/master/dist/index.js")).text;
  }

  return fetchScript._fetch = getScript();
}
fetchScript._fetch = null as null | Promise<string>;

electron.app.on("browser-window-created", (event, window) => {
  window.webContents.on("frame-created", (event, { frame }) => {
    frame.once("dom-ready", () => {
      if (frame?.url.includes("www.youtube.com") && isEnabled) {
        fetchScript().then((script) => frame.executeJavaScript(script));
      }
    });
  });
});