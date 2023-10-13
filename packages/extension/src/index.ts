import { waitForNode } from "common/dom";
import { browser } from "extension";

waitForNode("head").then(() => {
  const script = document.createElement("script");
  script.src = browser.runtime.getURL("scripts/compiled.js");
  script.id = "vx-script";

  document.head.append(script);
});
