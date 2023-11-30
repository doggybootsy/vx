import { useMemo, useState } from "react";

import { Panel } from "../../..";
import { Flex, Icons, FlexChild, Tooltip, Button, SearchBar } from "../../../../components";
import { plugins } from "../../../../plugins";
import { PluginCard } from "./card";
import { NO_RESULTS, NO_RESULTS_ALT, NoAddons } from "../shared";

export function Plugins() {
  const entries = useMemo(() => Object.entries(plugins), [ ]);

  const [ query, setQuery ] = useState("");
  const queredEntries = useMemo(() => entries.filter(([ id, plugin ]) => plugin.name.toLowerCase().includes(query.toLowerCase())), [ query, entries ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);

  return (
    <Panel 
      title="Plugins"
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
          <Tooltip text="Reload Discord">
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();
                  location.reload();
                }}
              >
                <Icons.Reload />
              </Button>
            )}
          </Tooltip>
        </>
      }
    >
      <div className="vx-addons-warning">
        <Icons.Warn 
          width={20} 
          height={20} 
          className="vx-addons-icon" 
        />
        <span>
          You need to reload to enable plugins!
        </span>
      </div>
      <Flex className="vx-addons" direction={Flex.Direction.VERTICAL} gap={8}>
        {queredEntries.length ? (
          queredEntries.map(([ key, plugin ]) => (
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