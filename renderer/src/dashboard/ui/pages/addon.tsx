import webpack from "renderer/webpack";
import pluginManager, { Plugin } from "renderer/addons/plugins";
import { useStateFromStores } from "renderer/hooks";
import { AddonCard } from "renderer/dashboard/ui/addons";
import DashboardPage, { HeaderBar, SearchBar } from "renderer/dashboard/ui/dashboardPage";
import { Icons } from "renderer/components";
import native from "renderer/native";
import themeManager, { Theme } from "renderer/addons/themes";
import storage from "renderer/storage";

function includesQuery(query: string, item?: string) {
  if (!item) return false;
  return item.toLocaleLowerCase().includes(query.toLocaleLowerCase());
};

function Addons({ icon, title, manager, path }: {
  icon: (props: Icons.IconProps) => React.JSX.Element,
  title: string,
  manager: typeof pluginManager | typeof themeManager,
  path: "plugins" | "themes"
}) {
  const React = webpack.common.React!;
  const [ query, setQuery ] = React.useState("");
  const addonSortingMethod = storage.use<"normal" | "reverse">("addon-sort-method", "normal");

  const addons = useStateFromStores([ manager ], () => manager.getAll() as Array<Theme | Plugin>);
  const filteredAddons = React.useMemo(() => {
    return addons.filter((plugin) => {
      if (includesQuery(query, plugin.id)) return true;
      if (includesQuery(query, plugin.meta.name)) return true;
      if (includesQuery(query, plugin.meta.author)) return true;
      return false;
    });
  }, [ query, addons ]);

  const sorted = React.useMemo(() => {
    const multiplier = addonSortingMethod === "reverse" ? -1 : 1;

    return filteredAddons.sort((a, b) => a.id.localeCompare(b.id) * multiplier);
  }, [ addonSortingMethod, filteredAddons ]);

  const sortIcon = React.useMemo(() => {
    if (addonSortingMethod === "reverse") return Icons.SortReverse;
    return Icons.Sort;
  }, [ addonSortingMethod ])

  return (
    <DashboardPage
      header={[
        <HeaderBar.getter.Icon
          icon={icon}
        />,
        <HeaderBar.getter.Title>
          {title}
        </HeaderBar.getter.Title>
      ]}
      toolbar={[
        <HeaderBar.getter.Icon
          icon={sortIcon}
          onClick={() => {
            storage.set("addon-sort-method", addonSortingMethod === "reverse" ? "normal" : "reverse");
          }}
          tooltip={addonSortingMethod === "reverse" ? "Sorting Z-A" : "Sorting A-Z"}
        />,
        <HeaderBar.getter.Icon
          icon={Icons.Folder}
          onClick={() => {
            native.openPath(native.path.join(native.dirname, "..", path));
          }}
          tooltip="Open Folder"
        />,
        <SearchBar.getter
          query={query}
          className="vx-dashboard-searchbar"
          disabled={false}
          autoFocus={true}
          size={(SearchBar.getter as any).Sizes.SMALL}
          onChange={(val: string) => setQuery(val)}
          onClear={() => {
            if (!query) return;
            setQuery("");
          }}
        />
      ]}
    >
      <div className="vx-addons-list-wrapper vx-dashboard-scroller">
        <div className="vx-addons-list">
          {sorted.map((addon) => (
            <AddonCard 
              addon={addon}
              key={`${addon.id}-${addon.initializedTimeStamp}`}
            />
          ))}
        </div>
      </div>
    </DashboardPage>
  )
};

export default Addons;