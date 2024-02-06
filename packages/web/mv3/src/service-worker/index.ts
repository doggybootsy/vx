import { browser } from "vx:self";
import { Connection } from "./connection";
import { logger } from "vx:logger";
import { install, update } from "./assets";

browser.runtime.onConnect.addListener((_connection: any) => {
  const connection = new Connection(_connection);

  connection.onMessage.addListener((msg) => {
    switch (msg.type) {
      case "update":
        update(msg.release);
        break;
    
      default:
        logger.log(`Unknown message type '${msg.type}'`);
        break;
    }
  });
});

browser.runtime.onInstalled.addListener(() => {
  install();  

  browser.tabs.query({ url: "*://*.discord.com/*" }, (tabs: any[]) => {
    for (const tab of tabs) {
      browser.tabs.reload(tab.id);
    }
  });
})