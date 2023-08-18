import webpack from "renderer/webpack";
import pluginManager from "renderer/addons/plugins";
import { Icons } from "renderer/components";
import Addons from "renderer/dashboard/ui/pages/addon";

function Plugins() {
  const React = webpack.common.React!;

  return (
    <Addons 
      icon={Icons.Code}
      title="Plugins"
      path="plugins"
      manager={pluginManager}
    />
  )
};

export default Plugins;