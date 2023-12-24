import { useCallback, useEffect, useInsertionEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { WindowUtil } from "../../../../webpack/common";
import * as windowApi from "../../../../api/window";
import { Editor } from "../../../../editor";
import { byKeys, byStrings, combine, getProxy, not } from "../../../../webpack";
import { Icons } from "../../../../components";
import { pluginStore } from "../../../../addons/plugins";
import { openNotification } from "../../../../api/notifications";
import { isInvalidSyntax } from "../../../../util";
import { useDiscordLocale } from "../../../../hooks";
import { IconFullProps } from "../../../../components/icons";
import { openAlertModal, openImageModal } from "../../../../api/modals";
import { getMeta, replaceMeta, replaceMetaValue } from "../../../../addons/meta";

const HeaderBar = getProxy<React.FunctionComponent<any> & Record<string, React.FunctionComponent<any>>>(combine(byKeys("Icon", "Title"), not(byStrings(".GUILD_HOME"))));

export function openWindow(id: string) {  
  const name = pluginStore.getMetaProperty(id, "name", "Unknown Plugin");
  const js = pluginStore.getJS(id);

  windowApi.openWindow({
    title: `Plugins - ${name}`,
    id: `PLUGIN_${id}`,
    render({ window }) {
      const ref = useRef<HTMLDivElement>(null);
      const lastSavedValue = useRef(js);
      const valueRef = useRef(js);
      const [ hasChanges, setHasChanges ] = useState(false);
      const [ name, setName ] = useState(() => pluginStore.getMetaProperty(id, "name", "Unknown Plugin"));
      const [ version, setVersion ] = useState(() => pluginStore.getVersionName(id));
      const locale = useDiscordLocale(false);
      const [ showCustomIcon, setShowCustomIcon ] = useState(true);
      const [ icon, setIcon ] = useState(() => pluginStore.getMeta(id).icon ?? null);
      const [ title, setTitle ] = useState(() => name);
      const editorRef = useRef<Editor>(null);

      useLayoutEffect(() => {
        if (!ref.current) return;

        const editor = new Editor(ref.current, "javascript", js);
        
        editor.on("change", (js) => {
          valueRef.current = js;
          setHasChanges(lastSavedValue.current !== js);
        });

        (editorRef as any).current = editor;
      }, [ ]);

      useInsertionEffect(() => {
        const style = document.createElement("style");
        style.append(document.createTextNode(`
        #editor { flex: 1 1 auto; width: 100%; }
        .vx-save { padding: 2px }
        #label-wrapper {
          position: relative;
        }
        .vx-input {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 16px;
          line-height: 32px;
          height: 32px;
          padding: 0 6px;
          border: none;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: pre;
          border-radius: 3px;
          -webkit-app-region: no-drag;
          background: transparent;
          color: var(--text-normal);
          box-sizing: border-box;
        }
        #label-wrapper:hover > .vx-input {
          box-shadow: inset 0 0 0 1px var(--background-tertiary);
        }
        #label-input {
          position: absolute;
          left: 0px;
          width: 100%;
        }
        #label-input:focus {
          background-color: var(--background-secondary);
          -webkit-box-shadow: inset 0 0 0 1px var(--background-tertiary);
          box-shadow: inset 0 0 0 1px var(--background-tertiary);
        }
        #label-input:not(:focus) {
          opacity: 0;
        }
        [data-popout-root] {
          background: var(--background-tertiary);
        }
        .vx-version {
          color: var(--header-secondary);
        }
        .vx-addon-icon {
          border-radius: 4px;
        }
        [class*="codeContainer_"] {
          position: relative;
        }
        [class*="codeContainer_"]:hover [class*="codeActions_"] {
          display: block;
        }
        [class*="codeContainer_"] code {
          user-select: text;
        }
        [class*="codeActions_"] {
          position: absolute;
          display: none;
          right: 4px;
          top: 8px;
          color: var(--text-normal);
          cursor: pointer;
        }
        `));
        window.document.head.appendChild(style);
      }, [ ]);
      // Idk if this is good or not | Should i use useEffect or this? (There is a chance that it can be done before useEffect so idk)
      useInsertionEffect(() => {
        function listener(event: MessageEvent) {   
          // Use custom event because message even doesnt work?       
          const customEvent = new CustomEvent("message");
          // @ts-expect-error
          customEvent.data = event.data;
          // @ts-expect-error
          customEvent.source = event.source;
          self.dispatchEvent(customEvent);
        };

        window.addEventListener("message", listener);
        return () => {
          window.removeEventListener("message", listener);
        };
      }, [ ]);

      const updateCode = useCallback(() => {
        if (valueRef.current === lastSavedValue.current) return;

        const error = isInvalidSyntax(`"use strict";\n${valueRef.current}`);
        if (error) {
          openAlertModal("Syntax Error", [
            `\`\`\`js\n${String(error).replace("SyntaxError: ", "")}\n\`\`\``
          ]);
          // openNotification({
          //   title: `Unable to update '${pluginStore.getName(id)}'`,
          //   id: `update-p-${id}`,
          //   icon: Icons.Code,
          //   type: "danger",
          //   description: [
          //     "Code isn't valid JavaScript Syntax"
          //   ]
          // });
          return;
        }

        pluginStore.updateJS(id, valueRef.current);
        lastSavedValue.current = valueRef.current;
        
        const name = pluginStore.getName(id);

        setHasChanges(false);

        setName(name);
        setTitle(name);
        setIcon(pluginStore.getMeta(id).icon ?? null);
        setShowCustomIcon(true);

        openNotification({
          title: `Updated '${name}'`,
          id: `update-p-${id}`,
          icon: Icons.Code,
          type: "positive"
        });
      }, [ ]);

      const toolbar = (
        <>
          <HeaderBar.Icon
            icon={Icons.FloppyDisk}
            showBadge={hasChanges}
            onClick={() => updateCode()}
            tooltip="Save"
          />
          <HeaderBar.Icon
            icon={Icons.Help}
            onClick={(event: React.MouseEvent) => {
              WindowUtil.handleClick({
                href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
              }, event);
            }}
            tooltip="Help"
          />
        </>
      );

      useEffect(() => {
        window.document.title = `Plugins - ${title}`;
      }, [ name ]);

      useEffect(() => {
        setName(pluginStore.getName(id));
        setTitle(pluginStore.getName(id));

        setVersion(pluginStore.getVersionName(id));
      }, [ locale ]);

      const shouldShowCustomIcon = useMemo(() => typeof icon === "string" && showCustomIcon, [ icon, showCustomIcon ]);

      return (
        <>
          <HeaderBar
            toolbar={toolbar}
            mobileToolbar={toolbar}
          >
            {shouldShowCustomIcon ? (
              <HeaderBar.Icon 
                // How do i make open in the window???
                // onClick={() => {
                //   openImageModal(icon!);
                // }}
                icon={(props: IconFullProps) => (
                  <img 
                    src={icon!} 
                    {...props} 
                    className={`vx-addon-icon ${props.className}`} 
                    onError={() => setShowCustomIcon(false)} 
                  />
                )} 
              />
            ) : (
              <HeaderBar.Icon icon={Icons.Code} />
            )}
            <HeaderBar.Title>
              <div id="label-wrapper">
                <input 
                  type="text" 
                  value={title} 
                  id="label-input" 
                  className="vx-input"
                  onChange={(event) => {
                    setTitle(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key.toLowerCase() !== "enter") return;
                    event.currentTarget.blur();
                  }}
                  onBlur={() => {
                    const trimmed = title.trim();

                    if (!trimmed) {
                      setTitle(name);
                      return;
                    };
                    if (name === trimmed) return;

                    if (editorRef.current) {
                      editorRef.current.setValue(
                        replaceMeta(valueRef.current, replaceMetaValue(getMeta(valueRef.current), "name", trimmed))
                      );
                    }

                    setTitle(trimmed);
                    setName(trimmed);
                  }}
                />
                <div id="label-text" className="vx-input">{title}</div>
              </div>
            </HeaderBar.Title>
            <HeaderBar.Divider />
            <HeaderBar.Title className="vx-version">
              {version}
            </HeaderBar.Title>
          </HeaderBar>
          <div id="editor" ref={ref} />
        </>
      )
    }
  })
};