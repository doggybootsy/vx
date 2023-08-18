import webpack from "renderer/webpack";
import * as patcher from "renderer/patcher";
import Notifications from "renderer/notifications/ui";

(async function() {
  const components = await webpack.getLazy<any>(m => m.Shakeable && m.Button);
  const React = webpack.common.React!;
  const { app } = webpack.getModule<{ app: string }>(m => m.app && m.layers)!;

  patcher.after("VX/Notifications", components.Shakeable.prototype, "render", (that, args, res: any) => {    
    if (!res.ref.current) return res;
    if (!res.ref.current.classList.contains(app)) return res;

    res.props.children.push(
      <Notifications />
    );

    return res;
  });
})();