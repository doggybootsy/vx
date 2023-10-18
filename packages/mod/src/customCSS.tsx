import { getProxyStore } from "./webpack";
import { React, dirtyDispatch } from "./webpack/common";
import editor from "./editor.html";
import { internalDataStore } from "./api/storage";
import { waitForNode } from "common/dom";

const PopoutWindowStore = getProxyStore("PopoutWindowStore");
const AccessibilityStore = getProxyStore("AccessibilityStore");
const ThemeStore = getProxyStore("ThemeStore");

const customCSS = internalDataStore.proxy["custom-css"] ?? "";

const customCSSNode = document.createElement("style");
customCSSNode.id = "vx-custom-css";
customCSSNode.appendChild(document.createTextNode(customCSS));

waitForNode("head").then((head) => head.append(customCSSNode));

export async function openWindow() {
  const id = "DISCORD_VX_CUSTOM_CSS";

  function Render() {
    React.useLayoutEffect(() => {
      const window = PopoutWindowStore.getWindow(id)!;

      const theme = ThemeStore.theme === "light" ? "vs" : "vs-dark";

      // @ts-expect-error
      window.Native = {
        autosave: internalDataStore.proxy["custom-css-autosave"] ?? true,
        callback(css: string) {
          customCSSNode.innerHTML = "";

          customCSSNode.appendChild(document.createTextNode(css));

          internalDataStore.proxy["custom-css"] = css;
        },
        minimap: internalDataStore.proxy["custom-css-minimap"] ?? true,
        quit: () => PopoutWindowStore.unmountWindow(id),
        reducedMotion: AccessibilityStore.useReducedMotion,
        showTitlebar: true,
        theme: theme,
        value: customCSSNode.innerHTML
      };

      const app = window.document.getElementById("app-mount")!;

      for (const node of editor.body.children) {
        if (node.tagName === "SCRIPT") {
          const script = document.createElement("script");
          script.innerHTML = node.innerHTML;
          app.append(script);
          continue;
        };

        app.append(node.cloneNode(true));
      };
    }, [ ]);
    
    return null;
  };

  dirtyDispatch({
    type: "POPOUT_WINDOW_OPEN",
    key: id,
    render: () => <Render />,
    features: {}
  });
};
