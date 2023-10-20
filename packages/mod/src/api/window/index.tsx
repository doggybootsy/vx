import { cache, getComponentType } from "../../util";
import { byStrings, getModule, getProxy, getProxyStore } from "../../webpack";
import { React, dirtyDispatch } from "../../webpack/common";

const filter = byStrings(".DnDProvider", ".POPOUT_WINDOW", ".guestWindow,");
// typeof proxyCache(() => any) === 'function' so react throws because PopoutWindow is forward ref and react thinks its not
const PopoutWindowModule = cache(() => getModule<React.FunctionComponent<PopoutWindowProps>>((m) => filter(getComponentType(m)))!);
function PopoutWindow(props: PopoutWindowProps) {
  return React.createElement(PopoutWindowModule(), props);
};

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
    features: {}
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