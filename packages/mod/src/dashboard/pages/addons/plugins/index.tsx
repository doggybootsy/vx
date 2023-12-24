import { useMemo, useState } from "react";

import { Panel } from "../../..";
import { Button, Flex, FlexChild, Icons, SearchBar, Tooltip } from "../../../../components";
import { Plugin, plugins } from "../../../../plugins";
import { PluginCard } from "./card";
import { NO_RESULTS, NO_RESULTS_ALT, NoAddons } from "../shared";
import { internalDataStore } from "../../../../api/storage";
import { pluginStore } from "../../../../addons/plugins";
import { useInternalStore } from "../../../../hooks";
import { openPluginSettingsModal } from "./modal";

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

  const name = pluginStore.getMetaProperty(id, "name", "Unknown Plugin");

  return {
    type: "custom",
    requiresRestart: false,
    id,
    toggle() {
      const isEnabled = pluginStore.isEnabled(id);
      if (isEnabled) {
        pluginStore.disable(id);
        return false;
      };

      pluginStore.enable(id);
      return true;
    },
    isEnabled() {
      return pluginStore.isEnabled(id);
    },
    getActiveState() { return this.isEnabled(); },
    originalEnabledState: false,
    name,
    description: pluginStore.getMetaProperty(id, "description", "No Description Provided"),
    authors: pluginStore.getMeta(id).authors ?? [],
    settings: Settings ? (() => openPluginSettingsModal(name, Settings!)) : null
  }
}
function convertToSafePlugin(plugin: Plugin): SafePlugin {
  return {
    type: "internal",
    id: plugin.id,
    requiresRestart: plugin.requiresRestart,
    toggle: () => plugin.toggle(),
    isEnabled: () => plugin.isEnabled(),
    getActiveState: () => plugin.getActiveState(),
    originalEnabledState: plugin.originalEnabledState,
    name: plugin.name,
    description: plugin.exports.description,
    authors: plugin.exports.authors,
    settings: plugin.exports.settings ? (() => openPluginSettingsModal(plugin.name, plugin.exports.settings!)) : null
  }
}

let search = "";
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

  const [ query, setQuery ] = useState(() => (internalDataStore.get("preserve-query") ?? true) ? search : "");
  const queredPlugins = useMemo(() => allPlugins.filter(([ id, plugin ]) => plugin.name.toLowerCase().includes(query.toLowerCase())), [ query, allPlugins ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);
  
  return (
    <Panel 
      title="Plugins"
      buttons={
        <>
          <Tooltip text="Upload">
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
          <Tooltip text="New">
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
            onChange={(query) => {
              setQuery(query);
              search = query;
            }}
            onClear={() => {
              setQuery("");
              search = "";
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
          <NoAddons message="No Results Found" img={alt ? NO_RESULTS_ALT : NO_RESULTS} />
        )}
      </Flex>
    </Panel>
  )
}