import webpack, { filters } from "renderer/webpack";
import * as patcher from "renderer/patcher";
import { findInReactTree } from "renderer/util";
import { routes } from "renderer/dashboard/routes";

(async function() {
  const layers = await webpack.getLazy<React.ComponentClass>(filters.byPrototypeKeys("ensureChannelMatchesGuild", "handleHistoryChange"));

  patcher.after("VX/dashboard", layers.prototype, "render", (that, args, res) => {    
    const channelsRoute = findInReactTree<React.ReactElement>(res, (item) => item && item.props?.path?.length > 5);
    if (!channelsRoute) return;

    channelsRoute.props.path = Array.from(new Set([
      ...channelsRoute.props.path,
      ...routes
    ]));
  });
})();