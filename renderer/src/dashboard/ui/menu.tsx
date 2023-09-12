import { components } from "renderer/menus";
import webpack from "renderer/webpack";
import pluginManager, { Plugin } from "renderer/addons/plugins";
import themeManager, { Theme } from "renderer/addons/themes";
import { useStateFromStores } from "renderer/hooks";
import CustomCSS from "renderer/ui/customCSS";
import { openWindow } from "renderer/window";
import native from "renderer/native";
import storage from "renderer/storage";
import { Icons } from "renderer/components";

function useAddonMenu(type: "themes" | "plugins") {
  const React = webpack.common.React!;

  const manager = React.useMemo(() => type === "plugins" ? pluginManager : themeManager, [ type ]);
  
  const addons = useStateFromStores([ manager ], () => manager.getAll());
  const details = useStateFromStores(addons, () => addons.map((addon: Theme | Plugin) => ({
    id: addon.id,
    enabled: addon.enabled,
    author: addon.meta.author,
    toggle: () => addon.toggle(),
    name: addon.meta.name || addon.id
  })));

  const [ query, setQuery ] = React.useState("");
  const filteredDetails = React.useMemo(() => {
    function includes(item?: string) {
      if (!item) return false;
      if (item.toLocaleLowerCase().includes(query.toLocaleLowerCase())) return true;
      return false;
    };

    return details.filter((detail) => {
      if (includes(detail.author)) return true;
      if (includes(detail.id)) return true;
      if (includes(detail.name)) return true;
      return false;
    });
  }, [ details, query ]);
  const addonSortingMethod = storage.use<"normal" | "reverse">("addon-sort-method", "normal");

  const sorted = React.useMemo(() => {
    const multiplier = addonSortingMethod === "reverse" ? -1 : 1;

    return filteredDetails.sort((a, b) => a.id.localeCompare(b.id) * multiplier);
  }, [ addonSortingMethod, filteredDetails ]);

  const sortIcon = React.useMemo(() => {
    if (addonSortingMethod === "reverse") return Icons.SortReverse;
    return Icons.Sort;
  }, [ addonSortingMethod ]);
  
  return (
    <components.MenuItem 
      id={`vx/${type}`}
      label={type === "plugins" ? "Plugins" : "Themes"}
      action={() => {
        webpack.common.navigation!.transitionTo(`/vx/${type}`);
      }}
    >
      <components.MenuControlItem 
        id={`vx/${type}/search`}
        control={(props, ref) => (
          <components.MenuSearchControl
            query={query}
            onChange={setQuery}
            ref={ref}
            {...props}
          />
        )}
      />
      {sorted.map((addon) => (
        <components.MenuCheckboxItem 
          id={`vx/${type}/${addon.id}`}
          key={`vx/${type}/${addon.id}`}
          label={addon.name}
          subtext={addon.author}
          action={addon.toggle}
          checked={addon.enabled}
        />
      ))}
      <components.MenuSeparator />
      <components.MenuItem
        label={addonSortingMethod === "reverse" ? "Sorting Z-A" : "Sorting A-Z"}
        id={`vx/${type}/sort`}
        action={() => {
          storage.set("addon-sort-method", addonSortingMethod === "reverse" ? "normal" : "reverse");
        }}
        icon={sortIcon}
        dontCloseOnActionIfHoldingShiftKey={true}
      />
      <components.MenuItem
        id={`vx/${type}/open`}
        label="Open Folder"
        action={() => {
          native.openPath(native.path.join(native.dirname, "..", type));
        }}
      />
    </components.MenuItem>
  )
};

function useMenu() {
  const React = webpack.common.React!;
  
  const pluginsMenu = useAddonMenu("plugins");
  const themesMenu = useAddonMenu("themes");

  return (
    <>
      <components.MenuItem 
        id="vx/home"
        label="Home"
        action={() => {
          webpack.common.navigation!.transitionTo("/vx");
        }}
      />
      {pluginsMenu}
      {themesMenu}
      <components.MenuItem 
        id="vx/store"
        label="Store"
        action={() => {
          webpack.common.navigation!.transitionTo("/vx/store");
        }}
      />
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

export default useMenu;