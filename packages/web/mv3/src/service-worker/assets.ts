import { browser } from "vx:self";
import { Connection } from "./connection";
import { VXMessageEvent, ipc } from "./events";

let release: Promise<Git.Release>;
async function getRelease(): Promise<Git.Release> {
  if (release) return release;
      
  return release = fetch("https://api.github.com/repos/doggybootsy/vx/releases/latest", { cache: "no-cache" }).then(r => r.json());
}

async function getAsset(type: "js" | "css", release: Promise<Git.Release> | Git.Release = getRelease()) {
  release = release instanceof Promise ? await release : release;  

  const asset = release.assets.find((asset) => asset.name.endsWith(`.${type}`))!;

  const response = await fetch(asset.browser_download_url, { cache: "no-cache" });
  return response.text();
}

export async function install() {
  const data = await browser.storage.local.get([ "js", "css" ]);

  let didChangeAnything = false;
  if (!data.js) {
    didChangeAnything = true;
    data.js = await getAsset("js");
  }
  if (!data.js) {
    didChangeAnything = true;
    data.css = await getAsset("css");
  }

  if (didChangeAnything) await browser.storage.local.set(data);

  ipc.dispatchEvent(new VXMessageEvent("ready", data));
}

export async function update(release: Git.Release) {
  const data = {
    js: await getAsset("js", release),
    css: await getAsset("css", release)
  };

  await browser.storage.local.set(data);

  Connection.reloadAll();
}