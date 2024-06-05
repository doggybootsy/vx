import { app } from "electron";
import { Storage } from "./storage";

// From zrodevkaan and modified to allow dynamic changing of volume

const frames = new Set<Electron.WebFrameMain>();

export function getVolume() {
  let volume = Storage.window.get("spotify-volume", .05);
  if (typeof volume !== "number") return .05;

  return Math.min(Math.max(volume, 0), 1);
}

export function setVolume(volume: number) {
  Storage.window.set("spotify-volume", volume);

  for (const frame of frames) {
    frame.executeJavaScript(`
    window.__vx__.volume = ${getVolume()};
    if (window.__vx__.audio) window.__vx__.audio.volume = window.__vx__.volume;
    `);
  }
}

// Fix Spotify Embeds RAYGUN BLASTING the hell out of your ears.
app.on("browser-window-created", (_, win) => {
  win.webContents.on("frame-created", (_, { frame }) => {
    frame.once("dom-ready", () => {
      let volume = Storage.window.get("spotify-volume", .05);
      if (typeof volume !== "number") volume = .05;

      volume = Math.min(Math.max(volume, 0), 1);

      if (!/^https:\/\/open\.spotify\.com\/embed/.test(frame.url)) return;

      frames.add(frame);

      win.webContents.executeJavaScript(`console.log("Spotify ${volume}")`);

      frame.executeJavaScript(`
window.__vx__ = {
  audio: null,
  volume: ${volume}
};
Audio.prototype.play = function play() {
  this.volume = window.__vx__.volume;
  window.__vx__.audio = this;
  return HTMLMediaElement.prototype.play.apply(this, arguments);
};
`);
  });
  });
});