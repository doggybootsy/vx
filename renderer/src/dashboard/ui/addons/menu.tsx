import { Plugin } from "renderer/addons/plugins";
import { Theme } from "renderer/addons/themes";
import { useStateFromStores } from "renderer/hooks";
import { MenuRenderProps, closeMenu } from "renderer/menus";
import { components as MenuComponents } from "renderer/menus";
import native from "renderer/native";
import { isURL } from "renderer/util";
import webpack from "renderer/webpack";
import { createPluginRoute } from "renderer/dashboard/routes";
import { Icons } from "renderer/components";
import { openDeleteAddonModal } from "renderer/dashboard/ui/addons/delete";

function AddonMenu({ addon, props }: { addon: Plugin | Theme, props: MenuRenderProps }) {
  const React = webpack.common.React!;
  const enabled = useStateFromStores([ addon ], () => addon.enabled);

  return (
    <MenuComponents.Menu
      navId="vx-addon-menu"
      onClose={closeMenu}
      {...props}
    >
      <MenuComponents.MenuCheckboxItem
        id="vx-addon-toggle"
        label="Enabled"
        checked={enabled}
        action={() => addon.toggle()}
      />
      {addon.meta.source && isURL(addon.meta.source) && (
        <MenuComponents.MenuItem
          id="vx-addon-source"
          label="Source"
          icon={Icons.Github}
          action={() => native.openExternal(addon.meta.source!)}
        />
      )}
      {(addon instanceof Plugin) && (typeof addon.exports.Settings === "function") && (
        <MenuComponents.MenuItem
          id="vx-addon-settings"
          label="Open Settings"
          disabled={!enabled}
          icon={Icons.Gear}
          action={() => {
            webpack.common.navigation!.transitionTo(
              createPluginRoute(addon)
            );
          }}
        />
      )}
      <MenuComponents.MenuSeparator />
      <MenuComponents.MenuItem
        id="vx-addon-delete"
        label="Delete"
        color="danger"
        icon={Icons.Trash}
        action={() => {
          openDeleteAddonModal(addon);
        }}
      />
    </MenuComponents.Menu>
  );
};

export default AddonMenu;