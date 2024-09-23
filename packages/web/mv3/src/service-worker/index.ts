import { browser } from "vx:self";
import { Connection } from "./connection";
import { logger } from "vx:logger";
import { assets } from "./assets";
import { BETTERDISCORD_API_THEMES } from "common/constants";

async function getCommunityThemes(connection: Connection) {
  logger.log("Getting community themes");
  
  const { json } = await request.json<BetterDiscord.Addon[]>(BETTERDISCORD_API_THEMES);

  connection.postMessage({
    type: "community-themes",
    data: json
  });

  logger.log("Found community themes");
}
async function fetchArrayBuffer(connection: Connection, input: string, id: number) {
  logger.log(`Fetching ${input}`);
  
  const { arrayBuffer } = await request.arrayBuffer(input);

  connection.postMessage({
    type: "array-buffer",
    data: [...new Uint8Array(arrayBuffer)],
    id
  });

  logger.log(`Fetched ${input}`);
}

browser.runtime.onConnect.addListener((_connection: any) => {  
  const connection = new Connection(_connection);

  connection.onMessage.addListener((msg) => {    
    switch (msg.type) {
      case "update":
        assets.update(msg.release);
        break;
      case "get-community-themes":
        getCommunityThemes(connection);
        break;
      case "fetch-array-buffer":
        fetchArrayBuffer(connection, msg.input, msg.id);
        break;
      case "ping":
        logger.log(`Received ping from '${connection.tabId}'`);
        connection.postMessage({ type: "pong" });
        break;
    }
  });
});

setTimeout(() => {  
  assets.initialize();
});

// Defining because of typing lol
Object.defineProperty(window, "VX", {
  value: {
    Connection,
    browser,
    assets
  }
});