import { Logger, logger } from "vx:logger";
import { browser } from "vx:self";
import { assets } from "./assets";

interface BrowserEventTarget<T extends (...args: any[]) => void> {
  addListener(listener: (this: BrowserEventTarget<T>, ...args: Parameters<T>) => void): void,
  removeListener(listener: (this: BrowserEventTarget<T>, ...args: Parameters<T>) => void): void,
  hasListener(listener: (this: BrowserEventTarget<T>, ...args: Parameters<T>) => void): boolean,
  hasListeners(): boolean,
  dispatch(...args: unknown[]): unknown
}

function executeVXScript(connection: Connection) {
  if (!assets.isReady()) {
    logger.warn("Code isn't ready! Adding listener...");

    assets.whenReady(() => {
      connection.reload();
    });
    
    return;
  }

  logger.log(`Injecting script on tab id '${connection.tabId}'`);

  connection.eval((id: string, js: string) => {
    function getCommunityThemes(): Promise<BetterDiscord.Addon[]> {
      return new Promise((resolve) => {
        function listener(event: MessageEvent) {
          if (typeof event.data !== "object") return;
          if (event.data.from !== "vx") return;
          if (event.data.type === "community-themes") {
            resolve(event.data.data);
            globalThis.removeEventListener("message", listener);
          }
        }

        globalThis.addEventListener("message", listener);
        
        postMessage({
          type: "get-community-themes", 
          from: "vx"
        });
      });
    }

    (globalThis as typeof window).VXExtension = {
      id,
      update(release) {
        postMessage({
          type: "update", 
          from: "vx", 
          release
        });
      },
      getCommunityThemes
    };

    if (location.pathname.startsWith("/vx")) {
      location.replace(`/channels/@me?__vx_dashboard_path__=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (location.pathname === "/popout") {
      console.log("VX Skipping, is a popout");
      return;
    }
    if (typeof (globalThis as typeof window).webpackChunkdiscord_app === "object") {
      console.log("VX loaded to late aborting!");
      return;
    }    

    (0, eval)(js);
  }, [ browser.runtime.id, assets.getAsset("js") ]);

  connection.insertCSS(assets.getAsset("css"));
}

export class Connection {
  public static conections = new Map<number, Connection>();
  public static reloadAll() {
    logger.log(`Reloading ${this.conections.size} connection(s)!`);

    for (const [, conection ] of this.conections) conection.reload();
  }

  #connected = true;
  constructor(private readonly connection: any) {
    this.logger = logger.createChild("tab", String(this.tabId));

    Connection.conections.set(this.tabId, this);

    this.onDisconnect.addListener(() => {
      this.#connected = false;
      Connection.conections.delete(this.tabId);
    });
    
    executeVXScript(this);
  }

  private readonly logger: Logger;

  public get onDisconnect(): BrowserEventTarget<() => void> {
    return this.connection.onDisconnect;
  }
  public get onMessage(): BrowserEventTarget<(message: any) => void> {
    return this.connection.onMessage;
  }

  public get tabId(): number {
    return this.connection.sender.tab.id;
  }

  public postMessage(data: any) {
    if (!this.isConnected()) return;

    this.connection.postMessage(data);
  }

  public reload() {
    this.logger.debug("Reloading");
    browser.tabs.reload(this.tabId);
  }

  public eval(code: string | Function, args: any[] = []) {
    if (!this.isConnected()) return;

    this.logger.debug("Eval", { code, args, connection: this });

    if (typeof code === "function") code = `(${Function.prototype.toString.call(code)}).apply(this,arguments);`;

    browser.scripting.executeScript({
      target: {
        tabId: this.tabId
      },
      world: browser.scripting.ExecutionWorld.MAIN,
      injectImmediately: true,
      args: [ code, args ],
      func: (code: string, args: any[]) => {        
        new Function(code).apply(this, args);
      }
    });
  }

  public insertCSS(css: string) {
    if (!this.isConnected()) return () => {};

    const injection = {
      css,
      target: { tabId: this.tabId }
    };

    this.logger.debug("insertCSS", { css, connection: this });
    
    let didUndo = false;
    let undo = () => { didUndo = true; };
    browser.scripting.insertCSS(injection).then(() => {
      undo = () => browser.scripting.removeCSS(injection);
      if (didUndo) undo();
    });

    return () => undo();
  }

  public isConnected() {
    return this.#connected;
  }
}