import webpack from "renderer/webpack";
import pluginManager, { Plugin } from "renderer/addons/plugins";
import { useStateFromStores } from "renderer/hooks";
import { AddonCard } from "renderer/dashboard/ui/addons";
import DashboardPage, { HeaderBar, SearchBar } from "renderer/dashboard/ui/dashboardPage";
import { Icons } from "renderer/components";
import native from "renderer/native";
import themeManager, { Theme } from "renderer/addons/themes";
import storage from "renderer/storage";
import { className } from "renderer/util";

function includesQuery(query: string, tags: string[], item?: string) {
  if (!item) return false;
  if (!query && !tags.length) return true;

  const newTags = tags.concat();
  if (query) newTags.push(query);

  for (const search of newTags) {
    if (!item.toLocaleLowerCase().includes(search.toLocaleLowerCase())) continue;
    return true;
  }

  return false;
};

function Addons({ icon, title, manager, path }: {
  icon: (props: Icons.IconProps) => React.JSX.Element,
  title: string,
  manager: typeof pluginManager | typeof themeManager,
  path: "plugins" | "themes"
}) {
  const React = webpack.common.React!;
  
  const addonsGridLayout = storage.use("addons-grid-layout", true);

  const [ query, setQuery ] = React.useState("");
  const [ tags, setTags ] = React.useState<string[]>([ ]);
  const addonSortingMethod = storage.use<"normal" | "reverse">("addon-sort-method", "normal");

  const addons = useStateFromStores([ manager ], () => manager.getAll() as Array<Theme | Plugin>);
  const filteredAddons = React.useMemo(() => {    
    return addons.filter((plugin) => {
      if (includesQuery(query, tags, plugin.id)) return true;
      if (includesQuery(query, tags, plugin.meta.name)) return true;
      if (includesQuery(query, tags, plugin.meta.author)) return true;
      return false;
    });
  }, [ query, tags, addons ]);
  
  const sorted = React.useMemo(() => {
    const multiplier = addonSortingMethod === "reverse" ? -1 : 1;

    return filteredAddons.sort((a, b) => a.id.localeCompare(b.id) * multiplier);
  }, [ addonSortingMethod, filteredAddons ]);

  const sortIcon = React.useMemo(() => {
    if (addonSortingMethod === "reverse") return Icons.SortReverse;
    return Icons.Sort;
  }, [ addonSortingMethod ]);

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
          placeholder="Filter Addons"
          className="vx-dashboard-searchbar"
          tags={tags}
          onRemoveTag={(index) => {
            const newTags = tags.concat();

            newTags.splice(index, 1);

            setTags(newTags);
          }}
          onKeyDown={(event) => {
            if (!(event.key.toLocaleLowerCase() === "tab")) return;
            event.preventDefault();
            event.stopPropagation();
            
            if (!query) return;

            setTags(tags.concat(query));
            setQuery("");
          }}
          disabled={false}
          autoFocus={true}
          size={SearchBar.getter.Sizes.SMALL}
          onQueryChange={(val: string) => setQuery(val)}
          onClear={() => {
            if (!query) return;
            setQuery("");
          }}
        />
      ]}
    >
      <div className="vx-addons-list-wrapper vx-dashboard-scroller">
        <div className={className([ "vx-addons-list", addonsGridLayout && "vx-addons-list-grid" ])}>
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