import pluginManager, { Plugin } from "renderer/addons/plugins";
import { useStateFromStores } from "renderer/hooks";
import { ErrorBoundary } from "renderer/components";
import { Icons } from "renderer/components";
import { cache } from "renderer/util";
import webpack, { filters } from "renderer/webpack";
import { AddonIcon } from "renderer/dashboard/ui/addons/icon";
import DashboardPage, { HeaderBar } from "renderer/dashboard/ui/dashboardPage";

const useLocation = cache(() => webpack.getModule<() => { pathname: string }>(filters.byStrings(").location}"), { searchExports: true })!);

function PluginSettings() {
  const React = webpack.common.React!;
  const { pathname } = useLocation.getter();

  // Work around to allow me to have the page update
  const getPlugin = useStateFromStores([ pluginManager ], () => (addonId: string) => pluginManager.get(addonId))

  const details = React.useMemo(() => {
    const id = pathname.split("/").at(-1)!;

    const plugin = getPlugin(id);

    function notFound() {
      return (
        <div>
          Plugin not found or plugin doesn't have any settings
        </div>
      )
    };

    const ref: {
      Settings: () => React.ReactNode,
      plugin?: Plugin
    } = {
      Settings: notFound, 
      plugin
    };

    if (plugin) {
      if (typeof plugin.exports.Settings === "function") ref.Settings = plugin.exports.Settings;
    };

    return ref;
  }, [ pathname, getPlugin ]);

  return (
    <DashboardPage
      header={[
        details.plugin ? (
          <>
            {details.plugin.meta.name && (
              <>
                <HeaderBar.getter.Icon
                  icon={(props: { className: string }) => (
                    <div className={props.className}>
                      <AddonIcon 
                        addon={details.plugin!}
                        wrapperClassName="vx-header-wrapper"
                        spinnerClassName="vx-header-spinner"
                        className="vx-header-icon"
                      />
                    </div>
                  )}
                />
                <HeaderBar.getter.Title>
                  {details.plugin.meta.name}
                </HeaderBar.getter.Title>
                <HeaderBar.getter.Divider />
              </>
            )}
            <HeaderBar.getter.Title>
              {details.plugin.id}
            </HeaderBar.getter.Title>
          </>
        ) : (
          <>
            <HeaderBar.getter.Icon
              icon={Icons.Logo}
            />
            <HeaderBar.getter.Title>
              404
            </HeaderBar.getter.Title>
          </>
        )
      ]}
    >
      <div className="vx-dashboard-plugin vx-dashboard-scroller" data-vx-plugin-id={details.plugin ? details.plugin.id : "unknown"}>
        <ErrorBoundary>
          <details.Settings />
        </ErrorBoundary>
      </div>
    </DashboardPage>
  )
};

export default PluginSettings;