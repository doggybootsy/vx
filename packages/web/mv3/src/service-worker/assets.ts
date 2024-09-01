import { browser } from "vx:self";
import { Connection } from "./connection";
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

class AssetStore {
  constructor() {
    this.whenReadyAsync().then(() => logger.log("AssetStore is initialized"));
  }
  private css?: string;
  private js?: string;

  private listeners = new Set<() => void>();
  public addListener(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public async initialize() {
    logger.log("Initializing AssetStore");

    const hasPersistence = await this.hasPersistence();

    logger.log(`Has persistence '${hasPersistence}'`);
    
    if (hasPersistence) {
      if (await this.usePersistence()) return;
    }

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

    this.css = data.css;
    this.js = data.js;

    await this.updatePersistence();

    for (const listener of this.listeners) {
      try {
        listener();
      } catch (error) {
        continue;
      } finally {
        this.listeners.delete(listener);
      }
    }
    
    browser.tabs.query({ url: "*://*.discord.com/*" }, (tabs: { id: number }[]) => {
      for (const tab of tabs) {
        if (Connection.conections.has(tab.id)) continue;
        browser.tabs.reload(tab.id);
        logger.log(`Reloading tab id ${tab.id}`);
      }
    });
  }

  public async update(release: Git.Release) {
    const data = {
      js: await getAsset("js", release),
      css: await getAsset("css", release)
    };
  
    await browser.storage.local.set(data);

    await this.updatePersistence();
    
    Connection.reloadAll();
  }

  public async hasPersistence() {
    // const a = await browser.storage.session.get([ "js", "css" ]);

    return await browser.storage.session.getBytesInUse() > 0;
  }

  public async updatePersistence() {
    logger.log("Updating session storage");
    
    await browser.storage.session.set({ css: this.css, js: this.js });
  }

  public async usePersistence() {
    logger.log("Using session storage");

    const { css, js } = await browser.storage.session.get();

    this.css = css;
    this.js = js;    

    if (this.isReady()) {
      for (const listener of this.listeners) {
        try {
          listener();
        } catch (error) {
          continue;
        } finally {
          this.listeners.delete(listener);
        }
      }

      return true;
    }

    return false;
  }

  public isReady() {
    return typeof this.css === "string" && typeof this.css === "string";
  }
  public whenReady(callback: () => void) {
    if (this.isReady()) return void callback();
    this.addListener(() => callback());
  }
  public whenReadyAsync() {
    if (this.isReady()) return Promise.resolve();
    return new Promise<void>(r => this.addListener(r));
  }

  public getAsset(type: "css" | "js") {
    if (!this.isReady()) throw new Error("Assets are still loading");

    if (type === "css") return this.css!;
    return this.js!;
  }
}

export const assets = new AssetStore();