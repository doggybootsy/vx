import { useMemo, useState } from "react";

import { Panel } from "../../..";
import { Button, Flex, FlexChild, Icons, SearchBar, Tooltip } from "../../../../components";
import { useInternalStore } from "../../../../hooks";
import { NO_ADDONS, NO_RESULTS, NO_RESULTS_ALT, NoAddons } from "../shared";
import { ThemeCard } from "./card";
import { themeStore } from "../../../../addons/themes";
import { internalDataStore } from "../../../../api/storage";
import { Messages } from "@i18n";

let search = "";
export function Themes() {
  const [ query, setQuery ] = useState(() => (internalDataStore.get("preserve-query") ?? true) ? search : "");

  const keys = useInternalStore(themeStore, () => {
    const keys = themeStore.keys();

    return keys.sort((a, b) => themeStore.getName(a).localeCompare(themeStore.getName(b)));
  });
  const queredKeys = useMemo(() => keys.filter((key) => themeStore.getName(key).toLowerCase().includes(query.toLowerCase())), [ query, keys ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);

  return (
    <Panel
      title={Messages.THEMES}
      buttons={
        <>
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