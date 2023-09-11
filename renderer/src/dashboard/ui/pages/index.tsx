import { cache } from "renderer/util";
import webpack, { filters } from "renderer/webpack";
import Home from "renderer/dashboard/ui/pages/home";
import Settings from "renderer/dashboard/ui/pages/settings";
import Plugins from "renderer/dashboard/ui/pages/plugins";
import Themes from "renderer/dashboard/ui/pages/themes";
import PluginSettings from "renderer/dashboard/ui/pages/pluginSetting";
import Store from "renderer/dashboard/ui/pages/store";

const useLocation = cache(() => webpack.getModule<() => { pathname: string }>(filters.byStrings(").location}"), { searchExports: true })!);

function Page() {
  const React = webpack.common.React!;
  const { pathname } = useLocation()(); 

  return (
    <>
      {pathname === "/vx" && (
        <Home key="vx-home" />
      )}
      {pathname === "/vx/settings" && (
        <Settings key="vx-settings" />
      )}
      {pathname === "/vx/plugins" && (
        <Plugins key="vx-plugins" />
      )}
      {/\/vx\/plugins\//.test(pathname) && (
        <PluginSettings key="vx-pluginsettings" />
      )}
      {pathname === "/vx/themes" && (
        <Themes key="vx-themes" />
      )}
      {pathname === "/vx/store" && (
        <Store key="vx-store" />
      )}
    </>
  )
};

export default Page;