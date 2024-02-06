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
});