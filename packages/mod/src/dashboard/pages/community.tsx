import { useState } from "react";
import { Panel } from "..";
import { internalDataStore } from "../../api/storage";
import { SearchBar } from "../../components";

let search = "";
export function Community({ title }: { title: string }) {
  const [ query, setQuery ] = useState(() => (internalDataStore.get("preserve-query") ?? true) ? search : "");

  return (
    <Panel
      title={title}
      buttons={
        <>
          <SearchBar 
            query={query}
            size={SearchBar.Sizes.SMALL}
            onQueryChange={(query) => {
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
      indev
    </Panel>
  )
}