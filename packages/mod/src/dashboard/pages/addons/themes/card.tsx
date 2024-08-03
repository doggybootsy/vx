import { useDeferredValue, useLayoutEffect, useMemo, useState } from "react";
import { Icons, Button, Tooltip, Switch, Mask } from "../../../../components";
import { openWindow } from "./popout";
import { themeStore } from "../../../../addons/themes";
import { useInternalStore, useUser } from "../../../../hooks";
import { openConfirmModal, openExternalWindowModal, openInviteModal, openUserModal } from "../../../../api/modals";
import { Messages } from "vx:i18n";
import { LayerManager, openUserContextMenu } from "@webpack/common";
import { generateFaviconURL, getDefaultAvatar } from "../../../../util";
import { internalDataStore } from "../../../../api/storage";
import { addons } from "../../../../native";

function AuthorIcon({ dev, isLast }: { dev: { discord?: string, username: string }, isLast: boolean }) {
  const user = useUser(dev.discord);

  const randomDefaultAvatar = useMemo(() => getDefaultAvatar(dev.discord), [ ]);

  const backgroundImage = useMemo(() => {
    const wrapURL = (url: string) => `url(${JSON.stringify(url)})`;

    if (user) return wrapURL(user.getAvatarURL(undefined, 120, true));
    return wrapURL(randomDefaultAvatar);
  }, [ user ]);

  return (
    <Mask
      mask={isLast ? "none" : "avatar-overlay"}
      height={24}
      width={24}
    >
      <Tooltip text={dev.username}>
        {(props) => (
          <div 
            {...props}
            onClick={() => {
              if (!dev.discord) return;
              openUserModal(dev.discord);
            }}
            onContextMenu={(event) => {
              props.onContextMenu();

              if (!user) return;
              openUserContextMenu(event, user);
            }}
            className="vx-addon-author"
            style={{ backgroundImage }} 
          />
        )}
      </Tooltip>
    </Mask>
  );
}

export function ThemeCard({ id }: { id: string }) {
  const [ isEnabled, setEnabled ] = useState(() => themeStore.isEnabled(id));
  const [ showFavicon, setShowFavicon ] = useState(() => internalDataStore.get("show-favicon") ?? true);

  const meta = themeStore.getMeta(id);

  const authors = themeStore.getAuthors(id);

  useLayoutEffect(() => {
    if (!meta.website) return;
    if (!(internalDataStore.get("show-favicon") ?? true)) return;

    const controller = new AbortController();

    const fetch = request(generateFaviconURL(meta.website), { cache: "force-cache" });

    fetch.then((res) => {
      if (controller.signal.aborted) return;      
      setShowFavicon(res.ok);
    });

    return () => controller.abort();
  }, [ meta.website ]);

  return (
    <div className="vx-addon-card" data-vx-type="theme" data-vx-addon-id={id}>
      <div className="vx-addon-top">
        <div className="vx-addon-icon-wrapper">
          <Icons.Palette className="vx-addon-icon" height={32} width={32} />
        </div>
        <div className="vx-addon-details">
          <div className="vx-addon-name">
            <span>
              {themeStore.getAddonName(id)}
            </span>
            <span className="vx-addon-version">
              {themeStore.getVersionName(id)}
            </span>
          </div>
          <div className="vx-addon-authors">
            {authors.map((dev, i) => (
              <AuthorIcon 
                dev={dev}
                isLast={i === (authors.length - 1)}
                key={`vx-p-${id}-a-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="vx-addon-description">{themeStore.getMetaProperty(id, "description", Messages.NO_DESCRIPTION_PROVIDED)}</div>
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
                }
                
                openConfirmModal("Are you sure?", [
                  `Are you sure you wan't to delete \`${name}\` (\`${id}\`)`,
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
                addons.themes.open(id);
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
                props.onClick();
                themeStore.download(id);
              }}
            >
              <Icons.Download />
            </Button>
          )}
        </Tooltip>
        <div className="vx-addon-actions">
          {typeof meta.license === "string" && (
            <Tooltip text={Messages.VIEW_LICENSE}>
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={(event) => {
                    props.onClick();

                    let href = `https://choosealicense.com/licenses/${meta.license.toLowerCase()}`;
                    try {
                      href = new URL(meta.license).href;
                    } 
                    catch (error) {}

                    openExternalWindowModal(href);
                  }}
                >
                  <Icons.Balance />
                </div>
              )}
            </Tooltip>
          )}
          {typeof meta.website === "string" && (
            <Tooltip text={Messages.VISIT_WEBSITE}>
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={() => {
                    props.onClick();
                    openExternalWindowModal(meta.website);
                  }}
                >
                  {showFavicon ? (
                    <img src={generateFaviconURL(meta.website)} width={24} height={24} className="vx-addon-website" />
                  ) : (
                    <Icons.Globe />
                  )}
                </div>
              )}
            </Tooltip>
          )}
          {typeof meta.invite === "string" && (
            <Tooltip text={Messages.JOIN_SUPPORT_SERVER}>
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={async () => {
                    props.onClick();

                    if (await openInviteModal(meta.invite)) LayerManager.pop();
                  }}
                >
                  <Icons.Discord />
                </div>
              )}
            </Tooltip>
          )}
          {typeof meta.source === "string" && (
            <Tooltip text={Messages.GO_TO_SOURCE}>
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={() => {
                    props.onClick();
                    openExternalWindowModal(meta.source);
                  }}
                >
                  <Icons.Github />
                </div>
              )}
            </Tooltip>
          )}
          <Switch 
            checked={isEnabled}
            onChange={() => {
              themeStore.toggle(id);
              setEnabled(themeStore.isEnabled(id));
            }}
          />
        </div>
      </div>
    </div>
  );
};