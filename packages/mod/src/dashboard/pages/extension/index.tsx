import { useMemo, useRef, useState } from "react";
import { Panel } from "../..";
import { Button, Flex, FlexChild, Icons, SearchBar, Tooltip } from "../../../components";
import { internalDataStore } from "../../../api/storage";
import { NO_ADDONS, NO_RESULTS, NO_RESULTS_ALT, NoAddons } from "../addons/shared";
import { openImageModal } from "../../../api/modals";
import { getDefaultAvatar } from "../../../util";
import { extensions } from "../../../native";
import { Messages } from "vx:i18n";

function Extension({ extension }: { extension: Electron.Extension }) {
  const random = useMemo(() => getDefaultAvatar(extension.id), [ ]);
  const errRef = useRef(false);

  const [ icon, setIcon ] = useState(() => {
    const icons = extension.manifest.icons;
    if (!icons) return random;
    const icon = Object.keys(extension.manifest.icons).sort((a,b) => Number(a) - Number(b)).at(-1);
    if (typeof icon === "string") return `${extension.url}${extension.manifest.icons[icon]}`;
    return random;
  });

  return (
    <div className="vx-addon-card" data-vx-type="extension" data-vx-addon-id={extension.id}>
      <div className="vx-addon-top">
        <div 
          className="vx-addon-icon-wrapper vx-addon-icon-img"
          onClick={() => {
            openImageModal(icon);
          }}
        >
          <img
            src={icon} 
            className="vx-addon-icon"
            onError={() => {
              if (errRef.current) return;
              errRef.current = true;
              setIcon(random);
            }} 
          />
        </div>
        <div className="vx-addon-details">
          <div className="vx-addon-name">
            {extension.name}
          </div>
          <div className="vx-addon-version">
            {extension.version}
          </div>
        </div>
      </div>
      {extension.manifest.description && (
        <div className="vx-addon-description">
          {extension.manifest.description}
        </div>
      )}
    </div>
  )
};

let search = "";
export function Extensions() {
  const allExtensions = useMemo(() => extensions.getAll(), [ ]);

  const [ query, setQuery ] = useState(() => (internalDataStore.get("preserve-query") ?? true) ? search : "");
  const quered = useMemo(() => allExtensions.filter((extension) => extension.name.toLowerCase().includes(query.toLowerCase())), [ query ]);

  const alt = useMemo(() => !Math.floor(Math.random() * 100), [ query ]);

  return (
    <Panel
      title="Extensions"
      buttons={
        <>
          {/* <Tooltip text="Restart Discord">
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();
                  app.restart();
                }}
              >
                <Icons.Reload />
              </Button>
            )}
          </Tooltip> */}
          <Tooltip text={Messages.DOWNLOAD_RDT}>
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                disabled={"__REACT_DEVTOOLS_GLOBAL_HOOK__" in window}
                onClick={() => extensions.downloadRDT()}
              >
                <Icons.React />
              </Button>
            )}
          </Tooltip>
          <Tooltip text={Messages.OPEN_FOLDER}>
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();
                  extensions.open();
                }}
              >
                <Icons.Folder />
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
        <FlexChild className="vx-addon-warning">
          <Icons.Warn />
          <div>
            To add or remove extensions you must fully restart discord
          </div>
        </FlexChild>
        {allExtensions.length ? (
          quered.length ? (
            quered.map((extension) => (
              <FlexChild key={`vx-e-${extension.id}`} >
                <Extension extension={extension} />
              </FlexChild>
            ))
          ) : (
            <NoAddons message={Messages.NO_RESULTS_FOUND} img={alt ? NO_RESULTS_ALT : NO_RESULTS} />
          )
        ) : (
          <NoAddons message={Messages.NO_ADDONS_FOUND.format({ type: Messages.EXTENSIONS }) as string} img={NO_ADDONS} />
        )}
      </Flex>
    </Panel>
  );
};