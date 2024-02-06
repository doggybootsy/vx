import { Logger, logger } from "vx:logger";
import { browser } from "vx:self";
import { ipc } from "./events";

interface BrowserEventTarget<T extends (...args: any[]) => void> {
  addListener(listener: (this: BrowserEventTarget<T>, ...args: Parameters<T>) => void): void,
  removeListener(listener: (this: BrowserEventTarget<T>, ...args: Parameters<T>) => void): void,
  hasListener(listener: (this: BrowserEventTarget<T>, ...args: Parameters<T>) => void): boolean,
  hasListeners(): boolean,
  dispatch(...args: unknown[]): unknown
}

function native(id: string) {
  window.VXExtension = {
    id,
    update(release) {
      postMessage({
        type: "update", 
        from: "vx", 
        release
      });
    }
  };
}

let js: string;
let css: string;
ipc.addEventListener("ready", (event) => {
  js = event.data.js;
  css = event.data.css;
});

function executeScript(connection: Connection) {
  if (!js || !css) {
    logger.warn("Code isn't ready! Adding listener...");

    ipc.addEventListener("ready", () => {
      connection.reload();
    });
    
    return;
  }

  connection.eval(native, { id: browser.runtime.id });

  connection.eval(`if(location.pathname === "/popout"){console.log("VX Skipping, is a popout");return;}if (typeof webpackChunkdiscord_app === "object"){console.log("VX loaded to late aborting!");console.log(Array.from(webpackChunkdiscord_app));return;};\n${js}`);

  connection.insertCSS(css);
}

export class Connection {
  public static conections = new Set<Connection>();
  public static reloadAll() {
    logger.log(`Reloading ${this.conections.size} connection(s)!`);

    for (const conection of this.conections) conection.reload();
  }

  #connected = true;
  constructor(private readonly connection: any) {
    this.logger = logger.createChild("tab", String(this.tabId));

    Connection.conections.add(this);

    this.onDisconnect.addListener(() => {
      this.#connected = false;
      Connection.conections.delete(this);
    });

    executeScript(this);
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

  public eval(code: string | Function, args: Record<string, any> = { }) {
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
      func: (code: string, args: Record<string, any>) => {
        const keys = Object.keys(args);
        const values = Object.values(args);

        new Function(...keys, code).apply(this, values);
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