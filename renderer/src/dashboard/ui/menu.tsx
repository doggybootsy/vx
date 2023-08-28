import { components } from "renderer/menus";
import webpack from "renderer/webpack";
import pluginManager from "renderer/addons/plugins";
import themeManager from "renderer/addons/themes";
import { useStateFromStores } from "renderer/hooks";
import CustomCSS from "renderer/ui/customCSS";
import { openWindow } from "renderer/window";

function Menu() {
  const React = webpack.common.React!;
  
  const plugins = useStateFromStores([ pluginManager ], () => pluginManager.getAll());
  const pluginDetails = useStateFromStores(plugins, () => plugins.map((plugin) => ({
    id: plugin.id,
    enabled: plugin.enabled,
    toggle: () => plugin.toggle(),
    name: plugin.meta.name || plugin.id
  })));

  const themes = useStateFromStores([ themeManager ], () => themeManager.getAll());
  const themeDetails = useStateFromStores(themes, () => themes.map((theme) => ({
    id: theme.id,
    enabled: theme.enabled,
    toggle: () => theme.toggle(),
    name: theme.meta.name || theme.id
  })));

  return (
    <>
      <components.MenuItem 
        id="vx/home"
        label="Home"
        action={() => {
          webpack.common.navigation!.transitionTo("/vx");
        }}
      />
      <components.MenuItem 
        id="vx/plugins"
        label="Plugins"
        action={() => {
          webpack.common.navigation!.transitionTo("/vx/plugins");
        }}
      >
        {pluginDetails.map((plugin) => (
          <components.MenuCheckboxItem 
            id={`vx/plugins/${plugin.id}`}
            label={plugin.name}
            action={plugin.toggle}
            checked={plugin.enabled}
          />
        ))}
      </components.MenuItem>
      <components.MenuItem 
        id="vx/themes"
        label="Themes"
        action={() => {
          webpack.common.navigation!.transitionTo("/vx/themes");
        }}
      >
        {themeDetails.map((theme) => (
          <components.MenuCheckboxItem 
            id={`vx/plugins/${theme.id}`}
            label={theme.name}
            action={theme.toggle}
            checked={theme.enabled}
          />
        ))}
      </components.MenuItem>
      <components.MenuItem 
        id="vx/settings"
        label="Settings"
        action={() => {
          webpack.common.navigation!.transitionTo("/vx/settings");
        }}
      />
      <components.MenuItem 
        id="vx/custom-css"
        label="Custom CSS"
        action={() => {
          openWindow({ id: "vx/custom-css", title: "Custom CSS", render: CustomCSS })
        }}
      />
    </>
  )
};

export default Menu;