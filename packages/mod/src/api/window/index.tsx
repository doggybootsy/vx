import { getComponentType, lazyComponent } from "../../util";
import { byStrings, getModule, getProxyStore } from "../../webpack";
import { React, dirtyDispatch } from "../../webpack/common";

const PopoutWindow = lazyComponent(() => {
  const filter = byStrings(".DnDProvider", ".POPOUT_WINDOW", "{guestWindow:");

  return getModule<React.FunctionComponent<PopoutWindowProps>>((m) => filter(getComponentType(m)))!;
});

const PopoutWindowStore = getProxyStore("PopoutWindowStore");

interface PopoutWindowProps {
  windowKey: string,
  withTitleBar: boolean,
  title: string,
  children: React.ReactNode
};

export function openWindow(opts: {
  id: string, 
  render: React.ComponentType<{ window: Window & typeof globalThis }>, 
  title: string
}) {
  const { id, render: Component, title } = opts;

  const windowKey = `DISCORD_VX_${id}`;

  function Render() {
    const window = React.useMemo(() => PopoutWindowStore.getWindow(windowKey)!, [ ]);

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
};

export function isWindowOpen(id: string) {
  return PopoutWindowStore.getWindowOpen(`DISCORD_VX_${id}`);
};

export function closeWindow(id: string) {
  if (!isWindowOpen(id)) return;
  
  try { PopoutWindowStore.unmountWindow(`DISCORD_VX_${id}`); } 
  catch (error) { }
};