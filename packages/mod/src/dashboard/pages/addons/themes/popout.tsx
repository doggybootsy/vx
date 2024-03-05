import { useDeferredValue, useInsertionEffect, useLayoutEffect, useRef, useState } from "react";
import * as windowApi from "../../../../api/window";
import { Editor } from "../../../../editor";
import { debounce } from "common/util";
import { byKeys, byStrings, combine, getProxy, not } from "@webpack";
import { Icons, Popout } from "../../../../components";
import { themeStore } from "../../../../addons/themes";
import { useInternalStore } from "../../../../hooks";
import { Messages } from "vx:i18n";
import { openExternalWindowModal } from "../../../../api/modals";
import { MenuComponents } from "../../../../api/menu";
import { git } from "vx:self";

const HeaderBar = getProxy<React.FunctionComponent<any> & Record<string, React.FunctionComponent<any>>>(combine(byKeys("Icon", "Title"), not(byStrings(".GUILD_HOME"))));

function MenuPopout({ closePopout }: { closePopout: () => void }) {
  return (
    <MenuComponents.Menu navId="vx-help-menu" onClose={closePopout}>
      <MenuComponents.MenuItem 
        label="CSS Help"
        id="js-help"
        action={() => {
          openExternalWindowModal("https://developer.mozilla.org/docs/Web/CSS");
        }}
        icon={Icons.MDN}
      />
      <MenuComponents.MenuItem 
        label="VX Documentation"
        id="vx-help"
        icon={Icons.Logo}
        disabled={!git.exists}
        action={() => {
          if (!git.exists) return;
          openExternalWindowModal("https://github.com/doggybootsy/vx/blob/main/docs/themes");
        }}
      />
    </MenuComponents.Menu>
  )
}

export function openWindow(id: string) {
  const name = themeStore.getAddonName(id);
  
  windowApi.openWindow({
    title: Messages.EDITOR_TITLE.format({ type: Messages.THEMES, name }) as string,
    id: `THEME_${id}`,
    render({ window }) {
      const ref = useRef<HTMLDivElement>(null);
      const [ show, setShow ] = useState(false);

      useLayoutEffect(() => {
        if (!ref.current) return;

        const css = themeStore.getCSS(id);
        const editor = new Editor(ref.current, "css", css);
        
        const debounced = debounce((css: string) => {          
          themeStore.setCSS(id, css);
        }, 500);
        
        editor.on("change", debounced);
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
        .vx-external-window-modal {
          border-radius: 8px;
          border: 1px solid var(--background-modifier-accent);
          padding: 8px;
          max-height: 144px;
          max-width: 498px;
          word-wrap: anywhere;
          font-family: var(--font-primary);
          font-size: 16px;
          line-height: 20px;
          font-weight: 400;
          color: var(--text-muted);
          user-select: text;
        }
        .vx-external-window-modal-host {
          color: var(--text-normal);
          font-family: var(--font-primary);
          font-size: 16px;
          line-height: 20px;
          font-weight: 600;
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
        }

        window.addEventListener("message", listener);
        return () => window.removeEventListener("message", listener);
      }, [ ]);

      const toolbar = (
        <>
          <Popout 
            renderPopout={(props) => (
              <MenuPopout closePopout={() => props.closePopout()} />
            )}
            position="bottom"
            shouldShow={show}
            onRequestClose={() => setShow(false)}
          >
            {(props, state) => (
              <HeaderBar.Icon
                {...props}
                onClick={() => setShow(!show)}
                icon={Icons.Help}
                tooltip={Messages.HELP}
                selected={state.isShown}
              />
            )}
          </Popout>
        </>
      );

      const [ name, setName ] = useState(() => themeStore.getAddonName(id));
      const storedName = useInternalStore(themeStore, () => themeStore.getAddonName(id));

      const deferredValue = useDeferredValue(storedName);
      useLayoutEffect(() => {
        setName(deferredValue);
        
        window.document.title = Messages.EDITOR_TITLE.format({ type: Messages.THEMES, name: storedName });
      }, [ deferredValue ]);

      return (
        <>
          <HeaderBar
            toolbar={toolbar}
            mobileToolbar={toolbar}
          >
            <HeaderBar.Icon icon={Icons.Palette} />
            <HeaderBar.Title>
              <div id="label-wrapper">
                <input 
                  type="text" 
                  value={name} 
                  id="label-input" 
                  className="vx-input"
                  onChange={(event) => {
                    setName(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key.toLowerCase() !== "enter") return;
                    event.currentTarget.blur();
                  }}
                  onBlur={() => {
                    const oldName = themeStore.getAddonName(id);
                    const trimmed = name.trim();
                    
                    setName(trimmed);

                    if (!trimmed) {
                      setName(oldName);
                      return;
                    };
                    if (oldName === trimmed) return;
    
                    themeStore.setName(id, trimmed);
                  }}
                />
                <div id="label-text" className="vx-input">{name}</div>
              </div>
            </HeaderBar.Title>
          </HeaderBar>
          <div id="editor" ref={ref} />
        </>
      )
    }
  })
}