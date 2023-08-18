import webpack, { filters } from "renderer/webpack";
import * as patcher from "renderer/patcher";
import { findInReactTree } from "renderer/util";
import { Icons } from "renderer/components";

const filter = filters.byStrings(".showDMHeader,", ".getMutablePrivateChannels");
const NavigatorButtonFilter = filters.byStrings("linkButtonIcon", ".linkButton,");

(async function() {
  const privateChannelList = await webpack.getLazyAndKey(filter)!;
  const NavigatorButton = webpack.getModule<React.FunctionComponent<any>>((m) => m.prototype && NavigatorButtonFilter(m.prototype.render), { searchExports: true })!;

  patcher.after("VX/dashboard", ...privateChannelList, (that, args, res) => {
    const props = findInReactTree(res, (item) => Array.isArray(item?.children));
    if (!props) return;
    const React = webpack.common.React!;

    const children = (props as { children: React.ReactNode[] }).children;

    const selected = location.pathname.startsWith("/vx");

    for (const child of children) {
      // @ts-expect-error
      if (child?.props?.selected) child.props.selected = !selected;
      if ((child as any)?.key === "vx-navigation-button") (child as React.ReactElement).props.selected = selected;
    }

    if (~children.findIndex((m) => (m as { key?: string })?.key === "vx-navigation-button")) return;

    children.push(
      <NavigatorButton 
        selected={selected}
        route="/vx"
        text="VX"
        key="vx-navigation-button"
        icon={Icons.Logo}
      />
    );
  });
})();