import { browser } from "vx:self";

const connection = browser.runtime.connect(browser.runtime.id);
connection.onDisconnect.addListener(() => location.reload());

addEventListener("message", async (event) => {
  const { data } = event;  

  if (!(data instanceof Object)) return;
  if (data.from !== "vx") return;

  if (data.type === "update") {  
    connection.postMessage({
      type: "update",
      release: data.release
    });
    
    return;
  }
  if (data.type === "get-community-themes") {  
    connection.postMessage({
      type: "get-community-themes"
    });
    
    return;
  }
});

connection.onMessage.addListener((msg: any) => {
  if (msg.type === "community-themes") {
    postMessage({
      from: "vx",
      type: "community-themes",
      data: msg.data
    });
  }
});