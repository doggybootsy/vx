import { useMemo, useState } from "react";

import { Header, Page } from "../../..";
import { Button, ErrorBoundary, Flex, FlexChild, Icons, SearchBar, Tooltip } from "../../../../components";
import { newPlugins, Plugin, plugins } from "vx:plugins";
import { PluginCard } from "./card";
import { NO_RESULTS, NO_RESULTS_ALT, NoAddons, queryStore } from "../shared";
import { pluginStore } from "../../../../addons/plugins";
import { useInternalStore } from "../../../../hooks";
import { openPluginSettingsModal } from "./modal";
import { FormattedMessage, Messages } from "vx:i18n";
import { addons } from "../../../../native";
import { IS_DESKTOP } from "vx:self";
import type { IconFullProps } from "../../../../components/icons";

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
  id: string,
  isNew: boolean,
  icon: React.ComponentType<IconFullProps>
};

function getCustomPlugin(id: string): SafePlugin {
  const Settings = pluginStore.getSettings(id);
  const Icon = pluginStore.getIcon(id);

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
    settings: Settings ? (() => openPluginSettingsModal(name, Settings!)) : null,
    isNew: false,
    icon: Icon ? (props) => (
      <ErrorBoundary fallback={<Icons.Code {...props} />}>
        <Icon {...props} />
      </ErrorBoundary>
    ) : Icons.Code
  }
}
function convertToSafePlugin(plugin: Plugin): SafePlugin {
  const id = plugin.id.replace(".app", "").replace(".web", "").replace(/-/g, "_").toUpperCase() as Uppercase<string>;

  let description = Messages[`${id}_DESCRIPTION`] as string | FormattedMessage;
  if (description instanceof FormattedMessage) description = description.format({ }) as string;

  return {
    type: "internal",
    id: plugin.id,
    requiresRestart: plugin.requiresRestart,
    toggle: () => plugin.toggle(),
    isEnabled: () => plugin.isEnabled(),
    getActiveState: () => plugin.getActiveState(),
    originalEnabledState: plugin.originalEnabledState,
    name: Messages[`${id}_NAME`],
    description,
    authors: plugin.authors,
    settings: plugin.Settings ? (() => openPluginSettingsModal(Messages[`${id}_NAME`], plugin.Settings!)) : null,
    isNew: newPlugins.has(plugin.id),
    icon: plugin.exports.icon || Icons.Code
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

    return plugins.sort((a, b) => {
      if (a[1].isNew && b[1].isNew) return 0;
      if (b[1].isNew) return 1;
      if (a[1].isNew) return -1;

      return a[1].name.localeCompare(b[1].name);
    });
  }, [ customPlugins, internalPlugins ]);

  const [ query, setQuery, clear ] = queryStore.use("plugins");
  const queredPlugins = useMemo(() => allPlugins.filter(([ id, plugin ]) => plugin.name.toLowerCase().includes(query.toLowerCase())), [ query, allPlugins ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);
  
  return (
    <Page 
      title={Messages.PLUGINS}
      icon={Icons.Code}
      toolbar={
        <>
          {IS_DESKTOP && (
            <Header.Icon 
              onClick={() => addons.plugins.openDirectory()}
              tooltip={Messages.OPEN_FOLDER}
              icon={Icons.Folder}
            />
          )}
          <Header.Icon 
            onClick={() => pluginStore.upload()}
            tooltip={Messages.UPLOAD}
            icon={Icons.Upload}
          />
          <Header.Icon 
            onClick={() => pluginStore.new()}
            tooltip={Messages.NEW_ADDON}
            icon={Icons.Plus}
          />
          <div className="vx-searchbar">
            <SearchBar 
              query={query}
              size={SearchBar.Sizes.SMALL}
              onQueryChange={setQuery}
              onClear={clear}
              autoFocus
            />
          </div>
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
    </Page>
  )
}