import { useMemo, useState } from "react";

import { Panel } from "../../..";
import { Button, Flex, FlexChild, Icons, SearchBar, Tooltip } from "../../../../components";
import { useInternalStore } from "../../../../hooks";
import { NO_ADDONS, NO_RESULTS, NO_RESULTS_ALT, NoAddons } from "../shared";
import { ThemeCard } from "./card";
import { themeStore } from "./store";

export function Themes() {
  const [ query, setQuery ] = useState("");

  const keys = useInternalStore(themeStore, () => {
    const keys = themeStore.keys();

    return keys.sort((a, b) => themeStore.getName(a).localeCompare(themeStore.getName(b)));
  });
  const queredKeys = useMemo(() => keys.filter((key) => themeStore.getName(key).toLowerCase().includes(query.toLowerCase())), [ query, keys ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);

  return (
    <Panel
      title="Themes"
      buttons={
        <>
          <SearchBar 
            query={query}
            size={SearchBar.Sizes.SMALL}
            onChange={setQuery}
            onClear={() => {
              setQuery("");
            }}
            autoFocus
          />
          <Tooltip text="Upload">
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
          <Tooltip text="New">
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
            <NoAddons message="No Results Found" img={alt ? NO_RESULTS_ALT : NO_RESULTS} />
          )
        ) : (
          <NoAddons message="No Themes Found" img={NO_ADDONS} />
        )}
      </Flex>
    </Panel>
  );
};