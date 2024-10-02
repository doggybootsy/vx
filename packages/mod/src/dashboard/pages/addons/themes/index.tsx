import { useMemo, useState } from "react";

import { Header, Page } from "../../..";
import { Button, Flex, FlexChild, Icons, SearchBar, Tooltip } from "../../../../components";
import { useInternalStore } from "../../../../hooks";
import { NO_ADDONS, NO_RESULTS, NO_RESULTS_ALT, NoAddons, queryStore } from "../shared";
import { ThemeCard } from "./card";
import { themeStore } from "../../../../addons/themes";
import { Messages } from "vx:i18n";
import { addons } from "../../../../native";
import { IS_DESKTOP } from "vx:self";

export function Themes() {
  const [ query, setQuery, clear ] = queryStore.use("themes")

  const keys = useInternalStore(themeStore, () => {
    const keys = themeStore.keys();

    return keys.sort((a, b) => themeStore.getAddonName(a).localeCompare(themeStore.getAddonName(b)));
  });
  const queredKeys = useMemo(() => keys.filter((key) => themeStore.getAddonName(key).toLowerCase().includes(query.toLowerCase())), [ query, keys ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);

  return (
    <Page
      title={Messages.THEMES}
      icon={Icons.Palette}
      toolbar={
        <>
          {IS_DESKTOP && (
            <Header.Icon 
              onClick={() => addons.themes.openDirectory()}
              tooltip={Messages.OPEN_FOLDER}
              icon={Icons.Folder}
            />
          )}
          <Header.Icon 
            onClick={() => themeStore.upload()}
            tooltip={Messages.UPLOAD}
            icon={Icons.Upload}
          />
          <Header.Icon 
            onClick={() => themeStore.new()}
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
        {keys.length ? (
          queredKeys.length ? (
            queredKeys.map((key) => (
              <FlexChild key={`vx-c-${key}`} >
                <ThemeCard id={key} />
              </FlexChild>
            ))
          ) : (
            <NoAddons message={Messages.NO_RESULTS_FOUND} img={alt ? NO_RESULTS_ALT : NO_RESULTS} />
          )
        ) : (
          <NoAddons message={Messages.NO_ADDONS_FOUND.format({ type: Messages.THEMES }) as string} img={NO_ADDONS} />
        )}
      </Flex>
    </Page>
  );
};