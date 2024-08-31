import { browser } from "vx:self";
import { Connection } from "./connection";
import { install, update } from "./assets";

browser.runtime.onConnect.addListener((_connection: any) => {
  const connection = new Connection(_connection);

  connection.onMessage.addListener((msg) => {
    switch (msg.type) {
      case "update":
        update(msg.release);
        break;
    }
  });
});

browser.runtime.onInstalled.addListener(() => {  
  install();
});
