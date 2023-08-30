import { themesElement } from "renderer/addons/themes";
import native from "renderer/native";
import { customCSSElement } from "renderer/ui/customCSS";
import { head } from "renderer/dom";

const pluginElement = document.createElement("vx-plugins");

const style = document.createElement("style");
style.setAttribute("data-vx-style", "");
style.innerHTML = native.readFile(native.path.join(native.dirname, "styles.css"));

head.append(style, pluginElement, themesElement, customCSSElement);

export function addStyle(id: string, css: string) {
  const style = document.createElement("style");
  style.innerHTML = css;
  style.setAttribute("data-vx-plugin-id", id);

  pluginElement.append(style);

  return () => style.remove();
};
export function removeStyle(id: string) {
  const node = pluginElement.querySelector(`[data-vx-plugin-id="${id}"]`);
  if (node) node.remove();
};

export function create(id: string) {
  return {
    add(css: string) {
      return addStyle(id, css);
    },
    remove() {
      removeStyle(id);
    }
  };
};