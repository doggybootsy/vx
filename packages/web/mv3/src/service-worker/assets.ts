import { browser } from "vx:self";
import { Connection } from "./connection";
import { VXMessageEvent, ipc } from "./events";
import { logger } from "vx:logger";

let release: Promise<Git.Release>;
async function getRelease(): Promise<Git.Release> {
  logger.log(`Getting release is-using-cache(${Boolean(release)})`);

  if (release) return release;
      
  return release = request.json<Git.Release>("https://api.github.com/repos/doggybootsy/vx/releases/latest", { cache: "no-cache" }).then(r => r.json);
}

async function getAsset(type: "js" | "css", release: Promise<Git.Release> | Git.Release = getRelease()) {
  logger.log(`Fetching asset '${type}'`);

  release = release instanceof Promise ? await release : release;  

  const asset = release.assets.find((asset) => asset.name.endsWith(`.${type}`))!;

  const response = await request(asset.browser_download_url, { cache: "no-cache" });
  return response.text();
}

export async function install() {
  logger.log("Starting install process");

  const data = await browser.storage.local.get([ "js", "css" ]);

  let didChangeAnything = false;
  if (!data.js) {
    didChangeAnything = true;
    data.js = await getAsset("js");
  }
  if (!data.css) {
    didChangeAnything = true;
    data.css = await getAsset("css");
  }

  logger.log(`Did make any changes '${didChangeAnything}'`);

  if (didChangeAnything) await browser.storage.local.set(data);

  ipc.dispatchEvent(new VXMessageEvent("code-ready", data));
    
  browser.tabs.query({ url: "*://*.discord.com/*" }, (tabs: { id: number }[]) => {
    for (const tab of tabs) {
      if (Connection.conections.has(tab.id)) continue;
      browser.tabs.reload(tab.id);
      logger.log(`Reloading tab id ${tab.id}`);
    }
  });
}

export async function update(release: Git.Release) {
  const data = {
    js: await getAsset("js", release),
    css: await getAsset("css", release)
  };

  await browser.storage.local.set(data);

  ipc.dispatchEvent(new VXMessageEvent("code-ready", data));

  Connection.reloadAll();
}