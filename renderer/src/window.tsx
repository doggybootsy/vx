import VXError from "renderer/error";
import { cache } from "renderer/util";
import webpack, { filters } from "renderer/webpack";

interface PopoutWindowProps {
  windowKey: string,
  withTitleBar: boolean,
  title: string,
  children: React.ReactNode
};

const PopoutWindow = cache(() => {
  const filter = filters.byStrings(".DnDProvider", ".POPOUT_WINDOW", ".guestWindow,");

  // Goes through react memos and forward refs
  function goThroughtReact(m: any) {
    if (m.type) return goThroughtReact(m.type);
    if (m.render) return goThroughtReact(m.render);
    return filter(m);
  };

  return webpack.getModule<React.FunctionComponent<PopoutWindowProps>>(goThroughtReact)!;
});

const PopoutWindowStore = cache(() => webpack.getStore("PopoutWindowStore")!);

export function openWindow(options: {
  id: string,
  render({ window }: { window: Omit<Window, "VX" | "VXNative"> }): React.ReactNode, 
  title: string
}) {
  if (!webpack.common.dispatcher) throw new VXError(VXError.codes.NO_DISPATCHER);

  const { id, title, render: Component } = options;

  const React = webpack.common.React!;

  function Render() {
    const window = React.useMemo(() => PopoutWindowStore().getWindow(`DISCORD_${id}`), [ ]);

    return (
      <PopoutWindow.getter
        windowKey={`DISCORD_${id}`}
        withTitleBar={true}
        title={title}
      >
        <Component window={window} />
      </PopoutWindow.getter>
    );
  };

  webpack.common.dispatcher.dispatch({
    type: "POPOUT_WINDOW_OPEN",
    key: `DISCORD_${id}`,
    render: () => <Render />,
    features: {}
  });

  return () => closeWindow(id);
};

export function closeWindow(id: string) {
  try { PopoutWindowStore().unmountWindow(`DISCORD_${id}`); } 
  catch (error) { }
};