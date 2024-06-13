import { useMemo, useState } from "react";

import { Panel } from "../../..";
import { Button, Flex, FlexChild, Icons, SearchBar, Tooltip } from "../../../../components";
import { Plugin, plugins } from "../../../../plugins";
import { PluginCard } from "./card";
import { NO_RESULTS, NO_RESULTS_ALT, NoAddons, queryStore } from "../shared";
import { pluginStore } from "../../../../addons/plugins";
import { useInternalStore } from "../../../../hooks";
import { openPluginSettingsModal } from "./modal";
import { Messages } from "vx:i18n";
import { addons } from "../../../../native";
import { IS_DESKTOP } from "vx:self";

export interface SafePlugin {
  type: "internal" | "custom",
  requiresRestart: boolean,
  toggle(): boolean,
  isEnabled(): boolean,
  originalEnabledState: boolean,
  getActiveState(): boolean,
  authors: { discord?: string, username: string }[],
  name: string,
  description: string,
  settings: (() => void) | null,
  id: string
};

function getCustomPlugin(id: string): SafePlugin {
  const Settings = pluginStore.getSettings(id);

  const name = pluginStore.getAddonName(id);

  return {
    type: "custom",
    requiresRestart: false,
    id,
    toggle() {
      const isEnabled = pluginStore.isEnabled(id);
      pluginStore.toggle(id);
      
      return !isEnabled;
    },
    isEnabled() {
      return pluginStore.isEnabled(id);
    },
    getActiveState() { return this.isEnabled(); },
    originalEnabledState: false,
    name,
    description: pluginStore.getMetaProperty(id, "description", Messages.NO_DESCRIPTION_PROVIDED),
    authors: pluginStore.getMeta(id).authors ?? [],
    settings: Settings ? (() => openPluginSettingsModal(name, Settings!)) : null
  }
}
function convertToSafePlugin(plugin: Plugin): SafePlugin {
  const id = plugin.id.replace(".app", "").replace(".web", "").replace(/-/g, "_").toUpperCase() as Uppercase<string>;

  return {
    type: "internal",
    id: plugin.id,
    requiresRestart: plugin.requiresRestart,
    toggle: () => plugin.toggle(),
    isEnabled: () => plugin.isEnabled(),
    getActiveState: () => plugin.getActiveState(),
    originalEnabledState: plugin.originalEnabledState,
    name: Messages[`${id}_NAME`],
    description: Messages[`${id}_DESCRIPTION`],
    authors: plugin.authors,
    settings: plugin.exports.settings ? (() => openPluginSettingsModal(Messages[`${id}_NAME`], plugin.exports.settings!)) : null
  }
}

export function Plugins() {
  const customPlugins = useInternalStore<[ string, SafePlugin ][]>(pluginStore, () => (
    pluginStore.keys().map((key) => [
      key,
      getCustomPlugin(key)
    ])
  ));

  const internalPlugins = useMemo<[ string, SafePlugin ][]>(() => Object.entries(plugins).map(([ key, plugin ]) => [ key, convertToSafePlugin(plugin) ]), [ ]);

  const allPlugins = useMemo(() => {
    const plugins: [ string, SafePlugin ][] = [];

    plugins.push(...customPlugins);
    plugins.push(...internalPlugins);

    return plugins.sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [ customPlugins, internalPlugins ]);

  const [ query, setQuery ] = useState(() => queryStore.get("plugins"));
  const queredPlugins = useMemo(() => allPlugins.filter(([ id, plugin ]) => plugin.name.toLowerCase().includes(query.toLowerCase())), [ query, allPlugins ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);
  
  return (
    <Panel 
    title={Messages.PLUGINS}
    buttons={
        <>
          {IS_DESKTOP && (
            <Tooltip text={Messages.OPEN_FOLDER}>
              {(props) => (
                <Button
                  {...props}
                  size={Button.Sizes.NONE}
                  look={Button.Looks.BLANK} 
                  className="vx-header-button"
                  onClick={() => {
                    props.onClick();
                    addons.plugins.openDirectory();
                  }}
                >
                  <Icons.Folder />
                </Button>
              )}
            </Tooltip>
          )}
          <Tooltip text={Messages.UPLOAD}>
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();

                  pluginStore.upload();
                }}
              >
                <Icons.Upload />
              </Button>
            )}
          </Tooltip>
          <Tooltip text={Messages.NEW_ADDON}>
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();

                  pluginStore.new();
                }}
              >
                <Icons.Plus />
              </Button>
            )}
          </Tooltip>
          <SearchBar 
            query={query}
            size={SearchBar.Sizes.SMALL}
            onQueryChange={(query) => {
              setQuery(query);
              queryStore.set("plugins", query);
            }}
            onClear={() => {
              setQuery("");
              queryStore.clear("plugins");
            }}
            autoFocus
          />
        </>
      }
    >
      <Flex className="vx-addons" direction={Flex.Direction.VERTICAL} gap={8}>
        {queredPlugins.length ? (
          queredPlugins.map(([ key, plugin ]) => (
            <FlexChild key={`vx-p-${key}`} >
              <PluginCard plugin={plugin} />
            </FlexChild>
          ))
        ) : (
          <NoAddons message={Messages.NO_RESULTS_FOUND} img={alt ? NO_RESULTS_ALT : NO_RESULTS} />
          )}
      </Flex>
    </Panel>
  )
}