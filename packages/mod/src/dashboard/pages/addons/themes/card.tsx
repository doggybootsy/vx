import { useDeferredValue, useLayoutEffect, useState } from "react";
import { Icons, Button, Tooltip, Switch } from "../../../../components";
import { openWindow } from "./popout";
import { themeStore } from "../../../../addons/themes";
import { useInternalStore } from "../../../../hooks";
import { openConfirmModal } from "../../../../api/modals";
import { Messages } from "@i18n";

export function ThemeCard({ id }: { id: string }) {
  const [ name, setName ] = useState(() => themeStore.getName(id));
  const { isEnabled, storedName } = useInternalStore(themeStore, () => ({
    isEnabled: themeStore.isEnabled(id),
    storedName: themeStore.getName(id)
  }));

  const deferredValue = useDeferredValue(storedName);
  useLayoutEffect(() => {
    setName(deferredValue);
  }, [ deferredValue ]);
  
  return (
    <div className="vx-addon-card" data-vx-type="theme" data-vx-addon-id={id}>
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
        </div>
      </div>
      <div className="vx-addon-divider" />
      <div className="vx-addon-footer">
        <Tooltip text={Messages.DELETE}>
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
        <Tooltip text={Messages.EDIT}>
          {(props) => (
            <Button
              size={Button.Sizes.ICON}
              {...props}
              onClick={() => {
                props.onClick();
                openWindow(id);
              }}
            >
              <Icons.Pencil />
            </Button>
          )}
        </Tooltip>
        <Tooltip text={Messages.DOWNLOAD}>
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