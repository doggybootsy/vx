import electron from "electron";

let isEnabled = false;

export function adblock(state?: boolean): boolean {
  if (arguments.length === 0) return isEnabled;
  if (typeof state === "boolean") return isEnabled = state!;
  return isEnabled;
}

class ScriptStore {
  public url = "https://raw.githubusercontent.com/AdguardTeam/BlockYouTubeAdsShortcut/master/dist/index.js";

  private async _fetch() {
    await electron.app.whenReady();

    const request = await electron.session.defaultSession.fetch(this.url);

    return await request.text();
  }
  public async fetch() {
    const fetch = this._fetch();
    this.fetch = () => fetch;
    return fetch;
  }
}

const scriptStore = new ScriptStore();

electron.app.on("browser-window-created", (event, window) => {
  window.webContents.on("frame-created", (event, { frame }) => {
    frame.once("dom-ready", () => {
      if (frame?.url.includes("www.youtube.com") && isEnabled) {
        scriptStore.fetch().then((script) => frame.executeJavaScript(script));
      }
    });
  });
});