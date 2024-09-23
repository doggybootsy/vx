import { useInsertionEffect, useMemo } from "react";

import { getComponentType, cacheComponent } from "../../util";
import { byStrings, getModule, getProxyStore } from "@webpack";
import { dirtyDispatch } from "@webpack/common";
import { waitForNode } from "common/dom";

const PopoutWindow = cacheComponent(() => {
  const filter = byStrings(".DnDProvider", ".POPOUT_WINDOW", "{guestWindow:");

  return getModule<React.FunctionComponent<PopoutWindowProps>>((m) => filter(getComponentType(m)))!;
});

const PopoutWindowStore = getProxyStore("PopoutWindowStore");

interface PopoutWindowProps {
  windowKey: string,
  withTitleBar: boolean,
  title: string,
  children: React.ReactNode
}

interface OpenWindowOptions {
  id: string, 
  render: React.ComponentType<{ window: Window & typeof globalThis }>, 
  title: string,
  wrap?: boolean,
  css?: string
}

export function openWindow(opts: OpenWindowOptions) {
  const { id, render: Component, title, wrap = true, css } = opts;

  const windowKey = `DISCORD_VX_${id}`;

  function Render() {
    const window = useMemo(() => PopoutWindowStore.getWindow(windowKey)!, [ ]);

    useInsertionEffect(() => {
      if (typeof css !== "string") return;

      let style: HTMLStyleElement | null = window.document.createElement("style");
      style.textContent = css;

      waitForNode("head", { target: window.document }).then(() => {
        if (!style) return;

        window.document.head.append(style);
      });

      return () => {
        style!.remove();
        style = null;
      }
    }, [ ]);

    if (!wrap) return <Component window={window} />;

    return (
      <PopoutWindow
        windowKey={windowKey}
        title={title}
        withTitleBar
      >
        <Component window={window} />
      </PopoutWindow>
    );
  };

  dirtyDispatch({
    type: "POPOUT_WINDOW_OPEN",
    key: windowKey,
    render: () => <Render />,
    features: {
      popout: true
    }
  });

  return () => closeWindow(id);
}

export function isWindowOpen(id: string) {
  return PopoutWindowStore.getWindowOpen(`DISCORD_VX_${id}`);
}

export function closeWindow(id: string) {
  if (!isWindowOpen(id)) return;
  
  try { PopoutWindowStore.unmountWindow(`DISCORD_VX_${id}`); } 
  catch (error) { }
}