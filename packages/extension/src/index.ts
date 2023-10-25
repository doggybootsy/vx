import { waitForNode } from "common/dom";
import { browser } from "self";

waitForNode("head").then(() => {
  const script = document.createElement("script");
  script.src = browser.runtime.getURL("scripts/build.js");
  script.id = "vx-script";

  document.head.append(script);
});
