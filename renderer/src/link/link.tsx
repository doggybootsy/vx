import webpack from "renderer/webpack";
import { Icons } from "renderer/components";
import pluginManager from "renderer/addons/plugins";
import { useStateFromStores } from "renderer/hooks";
import { cache } from "renderer/util";
import { AddonIcon } from "renderer/dashboard/ui/addons/icon";

const getDefaultAvatarURL = cache(() => {
  const module = webpack.getModule<{ getDefaultAvatarURL: () => string }>(m => m.getDefaultAvatarURL)!;
  return () => module.getDefaultAvatarURL();
});

function Link({ location, pluginId }: { location: string, pluginId?: string }) {
  const React = webpack.common.React!;

  const getPlugin = useStateFromStores([ pluginManager ], () => (addonId: string) => pluginManager.get(addonId))

  const plugin = React.useMemo(() => {
    if (pluginId) return getPlugin(pluginId);
  }, [ getPlugin, pluginId ]);

  const defaultIcon = React.useMemo(() => getDefaultAvatarURL()(), [ ]);

  return (
    <span
      className="vx-url"
      onClick={() => {        
        const url = pluginId ? `/vx/plugins/${pluginId}.vx.js` : `/vx${location === "home" ? "" : `/${location}`}`;
  
        webpack.common.navigation!.transitionTo(url);
      }}
    >
      <span>
        {location === "home" && (
          <Icons.Logo className="vx-url-icon" />
        )}
        {location === "plugins" && (
          <Icons.Code className="vx-url-icon" />
        )}
        {location === "themes" && (
          <Icons.Palette className="vx-url-icon" />
        )}
        {location === "settings" && (
          <Icons.Gear className="vx-url-icon" />
        )}
      </span>
      <span>
        {location}
      </span>
      {(plugin || pluginId) && (
        <>
          <span>
            <svg className="vx-url-seperator" aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
              <g fill="none" fill-rule="evenodd">
                <polygon fill="currentColor" fill-rule="nonzero" points="8.47 2 6.12 4.35 13.753 12 6.12 19.65 8.47 22 18.47 12" />
                <polygon points="0 0 24 0 24 24 0 24" />
              </g>
            </svg>
          </span>
          {plugin ? (
            <AddonIcon 
              addon={plugin}
              wrapperClassName="vx-url-plugin-icon-wrapper"
              spinnerClassName="vx-url-plugin-icon-spinner"
              className="vx-url-plugin-icon"
            />
          ) : (
            <div className="vx-url-plugin-icon-wrapper">
              <img src={defaultIcon} className="vx-url-plugin-icon" />
            </div>
          )}
          <span>
            {plugin ? plugin.meta.name ?? plugin.id : pluginId}
          </span>
        </>
      )}
    </span>
  )
};

export default Link;