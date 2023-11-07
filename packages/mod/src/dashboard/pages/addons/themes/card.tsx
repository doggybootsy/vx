import { React } from "../../../../webpack/common";
import { Icons, Button, Tooltip, Switch } from "../../../../components";
import { openWindow } from "./popout";
import { themeStore } from "./store";
import { useDeferredEffect, useInternalStore } from "../../../../hooks";
import { openConfirmModal } from "../../../../api/modals";

export function ThemeCard({ id }: { id: string }) {
  const [ name, setName ] = React.useState(() => themeStore.getName(id));
  const { isEnabled, storedName } = useInternalStore(themeStore, () => ({
    isEnabled: themeStore.isEnabled(id),
    storedName: themeStore.getName(id)
  }));

  useDeferredEffect((deferredValue) => {
    setName(deferredValue);
  }, storedName);
  
  return (
    <div className="vx-addon-card">
      <div className="vx-addon-top">
        <div className="vx-addon-icon-wrapper">
          <Icons.Palette className="vx-addon-icon" height={32} width={32} />
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
                const oldName = themeStore.getName(id);
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
                  themeStore.delete(id);
                  return;
                };
                
                openConfirmModal("Are you sure?", [
                  `Are you sure you wan't to delete \`${storedName}\` (\`${id}\`)`,
                  "You cannot recover deleted Themes"
                ], {
                  confirmText: "Delete",
                  danger: true,
                  onConfirm() {
                    themeStore.delete(id);
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
                themeStore.download(id);
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
              themeStore.toggle(id);
            }}
          />
        </div>
      </div>
    </div>
  );
};