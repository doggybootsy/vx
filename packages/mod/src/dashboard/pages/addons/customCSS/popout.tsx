import { React, WindowUtil } from "../../../../webpack/common";
import * as windowApi from "../../../../api/window";
import { Editor } from "../../../../editor";
import { debounce } from "common/util";
import { byKeys, byStrings, combine, getProxy, not } from "../../../../webpack";
import { Icons } from "../../../../components";
import { customCSSStore } from "./store";
import { useInternalStore } from "../../../../hooks";

const HeaderBar = getProxy<React.FunctionComponent<any> & Record<string, React.FunctionComponent<any>>>(combine(byKeys("Icon", "Title"), not(byStrings(".GUILD_HOME"))));

export function openWindow(id: string) {
  const name = customCSSStore.getName(id);
  
  windowApi.openWindow({
    title: `Custom CSS - ${name}`,
    id: `CUSTOM_CSS_${id}`,
    render({ window }) {
      const ref = React.useRef<HTMLDivElement>(null);

      React.useLayoutEffect(() => {
        if (!ref.current) return;

        const css = customCSSStore.getCSS(id);
        const editor = new Editor(ref.current, "css", css);
        
        const debounced = debounce((css: string) => {          
          customCSSStore.setCSS(id, css);
        }, 500);
        
        editor.on("change", debounced);
      }, [ ]);

      React.useInsertionEffect(() => {
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
        `));
        window.document.head.appendChild(style);
      }, [ ]);

      React.useInsertionEffect(() => {
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

      const toolbar = (
        <>
          <HeaderBar.Icon
            icon={Icons.Help}
            onClick={(event: React.MouseEvent) => {
              WindowUtil.handleClick({
                href: "https://developer.mozilla.org/en-US/docs/Web/CSS"
              }, event);
            }}
            tooltip="Help"
          />
        </>
      );

      const [ name, setName ] = React.useState(() => customCSSStore.getName(id));
      const storedName = useInternalStore(customCSSStore, () => customCSSStore.getName(id));

      const deferredValue = React.useDeferredValue(storedName);
      React.useLayoutEffect(() => {
        setName(deferredValue);
        
        window.document.title = `Custom CSS - ${storedName}`;
      }, [ deferredValue ]);

      return (
        <>
          <HeaderBar
            toolbar={toolbar}
            mobileToolbar={toolbar}
          >
            <HeaderBar.Icon icon={Icons.Brush} />
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
                    const oldName = customCSSStore.getName(id);
                    const trimmed = name.trim();
                    
                    setName(trimmed);

                    if (!trimmed) {
                      setName(oldName);
                      return;
                    };
                    if (oldName === trimmed) return;
    
                    customCSSStore.setName(id, trimmed);
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
};