import webpack from "renderer/webpack";
import themeManager from "renderer/addons/themes";
import { Icons } from "renderer/components";
import Addons from "renderer/dashboard/ui/pages/addon";

function Themes() {
  const React = webpack.common.React!;

  return (
    <Addons 
      icon={Icons.Palette}
      title="Themes"
      path="themes"
      manager={themeManager}
    />
  )
};

export default Themes;