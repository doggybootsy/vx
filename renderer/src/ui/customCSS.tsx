/**
 * I want to make a custom titlebar that has buttons like pinning the window
 * And for linux just have a row above the editor idk
 * I also want to switch to monaco
 */

import { getItem, setItem } from "renderer/storage";
import { debounce, whenDocumentReady } from "renderer/util";
import webpack from "renderer/webpack";

let macDragRegion: string;

// Adds the ace editors css, so i can grab them later
function ensureAceCSS() {
  const editor = ace.edit(document.createElement("div"));

  editor.getSession().setMode("ace/mode/css");

  editor.setTheme("ace/theme/monokai");

  queueMicrotask(() => {
    editor.destroy();
    editor.container.remove();
  });
};

whenDocumentReady(ensureAceCSS);

export const getCustomCSS = () => getItem("vx", "customCSS", "/* Custom CSS */\n");

export const customCSSElement = document.createElement("style");
customCSSElement.setAttribute("data-vx-custom-css", "");
customCSSElement.innerHTML = `${getCustomCSS()}\n/*# sourceURL=vx://VX/custom-css.css */`;

function CustomCSS({ window }: { window: Window }) {
  if (!macDragRegion) macDragRegion = webpack.getModule<Record<string, string>>(m => m.macDragRegion)!.macDragRegion!;

  const React = webpack.common.React!;
  const ref = React.useRef<HTMLDivElement>(null);

  const node = React.useMemo(() => document.createElement("div"), [ ]);
  const editor = React.useMemo(() => ace.edit(node), [ ]);
  const session = React.useMemo(() => editor.getSession(), [ ]);

  React.useInsertionEffect(() => {
    const styles: HTMLStyleElement[] = [ ];

    const style = document.createElement("style");
    style.innerHTML = `.${macDragRegion},.ace_print-margin-layer{ display: none }#editor {
      width: 100vw;
      height: 100vh;
    } .ace_editor {
      height: 100%;
    } #app-mount > div > div > :last-child:not(:first-child) {
      height: calc(100vh - 22px);
    }`;
    styles.push(style);
    window.document.head.appendChild(style);

    const aceStyles = Array.from(document.querySelectorAll("style")).filter(e => e.innerHTML.includes("sourceURL=ace/"));
    for (const styleNode of aceStyles) {
      const style = document.createElement("style");
      style.innerHTML = styleNode.innerHTML;
      styles.push(style);
      window.document.head.append(style);
    };

    return () => {
      for (const style of styles) {
        style.remove();
      }
    }
  }, [ ]);

  React.useLayoutEffect(() => {
    if (ref.current) ref.current.appendChild(node);

    editor.setTheme("ace/theme/monokai");

    session.setMode("ace/mode/css");

    editor.setValue(getCustomCSS());

    editor.resize(true);
    editor.focus();

    const onChange = debounce(() => {
      const value = editor.getValue();

      customCSSElement.innerHTML = `${value}\n/*# sourceURL=vx://VX/custom-css.css */`;
      setItem("vx", "customCSS", value);
    }, 500);

    editor.on("change", () => onChange());
  }, [ ]);

  return (
    <div ref={ref} id="editor" />
  )
};

export default CustomCSS;
