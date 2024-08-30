import { useMemo, useState } from "react";

import { Panel } from "../../..";
import { Button, Flex, FlexChild, Icons, SearchBar, Tooltip } from "../../../../components";
import { useInternalStore } from "../../../../hooks";
import { NO_ADDONS, NO_RESULTS, NO_RESULTS_ALT, NoAddons, queryStore } from "../shared";
import { ThemeCard } from "./card";
import { themeStore } from "../../../../addons/themes";
import { Messages } from "vx:i18n";
import { addons } from "../../../../native";
import { IS_DESKTOP } from "vx:self";

export function Themes() {
  const [ query, setQuery ] = useState(() => queryStore.get("themes"));

  const keys = useInternalStore(themeStore, () => {
    const keys = themeStore.keys();

    return keys.sort((a, b) => themeStore.getAddonName(a).localeCompare(themeStore.getAddonName(b)));
  });
  const queredKeys = useMemo(() => keys.filter((key) => themeStore.getAddonName(key).toLowerCase().includes(query.toLowerCase())), [ query, keys ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);

  return (
    <Panel
      title={Messages.THEMES}
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
                    addons.themes.openDirectory();
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

                  themeStore.upload();
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

                  themeStore.new();
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
              queryStore.set("themes", query);
            }}
            onClear={() => {
              setQuery("");
              queryStore.clear("themes");
            }}
            autoFocus
          />
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
    </Panel>
  );
};