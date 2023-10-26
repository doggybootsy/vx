import { React } from "../../../../webpack/common";
import { Icons, Button, Tooltip, Switch } from "../../../../components";
import { openWindow } from "./popout";
import { customCSSStore } from "./store";
import { useInternalStore } from "../../../../hooks";
import { openConfirmModal } from "../../../../api/modals";
import { download } from "../../../../util";

export function CustomCSSCard({ id }: { id: string }) {
  const [ name, setName ] = React.useState(() => customCSSStore.getName(id));
  const { isEnabled, storedName } = useInternalStore(customCSSStore, () => ({
    isEnabled: customCSSStore.isEnabled(id),
    storedName: customCSSStore.getName(id)
  }));

  const deferredValue = React.useDeferredValue(storedName);
  React.useLayoutEffect(() => {
    setName(deferredValue);
  }, [ deferredValue ]);
  
  return (
    <div className="vx-addon-card">
      <div className="vx-addon-top">
        <div className="vx-addon-icon-wrapper">
          <Icons.Brush className="vx-addon-icon" height={32} width={32} />
        </div>
        <div className="vx-addon-details">
          <div className="vx-addon-name">
            <input 
              type="text" 
              value={name} 
              className="vx-addon-input"
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
            <div className="vx-addon-input">{name}</div>
          </div>
          <div className="vx-addon-authors">
            
          </div>
        </div>
      </div>
      <div className="vx-addon-divider" />
      <div className="vx-addon-footer">
        <Tooltip text="Delete">
          {(props) => (
            <Button
              size={Button.Sizes.ICON}
              color={Button.Colors.RED}
              {...props}
              onClick={(event) => {
                props.onClick();

                if (event.shiftKey) {
                  customCSSStore.delete(id);
                  return;
                };
                
                openConfirmModal("Are you sure?", [
                  `Are you sure you wan't to delete \`${storedName}\` (\`${id}\`)`,
                  "You cannot recover deleted custom CSS snippets"
                ], {
                  confirmText: "Delete",
                  danger: true,
                  onConfirm() {
                    customCSSStore.delete(id);
                  }
                });
              }}
            >
              <Icons.Trash />
            </Button>
          )}
        </Tooltip>
        <Tooltip text="Download">
          {(props) => (
            <Button
              size={Button.Sizes.ICON}
              {...props}
              onClick={() => {
                download(`${id}.vx`, `vx${JSON.stringify({
                  type: "custom-css",
                  data: {
                    css: customCSSStore.getCSS(id),
                    name: customCSSStore.getName(id)
                  }
                })}`);
              }}
            >
              <Icons.Download />
            </Button>
          )}
        </Tooltip>
        <div className="vx-addon-actions">
          <Tooltip text="Edit">
            {(props) => (
              <div
                {...props}
                className="vx-addon-action"
                onClick={() => {
                  props.onClick();
                  openWindow(id);
                }}
              >
                <Icons.Pencil />
              </div>
            )}
          </Tooltip>
          <Switch 
            checked={isEnabled}
            onChange={() => {
              customCSSStore.toggle(id);
            }}
          />
        </div>
      </div>
    </div>
  );
};