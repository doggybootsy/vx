import { useLayoutEffect, useMemo, useState } from "react";
import { openConfirmModal, openImageModal, openInviteModal, openUserModal, openExternalWindowModal } from "../../../../api/modals";
import { Icons, Mask, Tooltip, Switch, Button } from "../../../../components";
import { className, getDefaultAvatar, generateFaviconURL } from "../../../../util";
import { LayerManager, openUserContextMenu } from "@webpack/common";
import { useInternalStore, useUser } from "../../../../hooks";
import { SafePlugin } from ".";
import { pluginStore } from "../../../../addons/plugins";
import { openWindow } from "./popout";
import { internalDataStore } from "../../../../api/storage";
import { Messages } from "vx:i18n";

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
};

export function PluginCard({ plugin }: { plugin: SafePlugin }) {
  const [ isEnabled, setEnabled ] = useState(() => plugin.isEnabled());
  const [ showFavicon, setShowFavicon ] = useState(() => internalDataStore.get("show-favicon") ?? true);
  const [ showCustomIcon, setShowCustomIcon ] = useState(true);

  const canViewSettings = useMemo(() => plugin.requiresRestart ? plugin.originalEnabledState === isEnabled ? isEnabled : false : isEnabled, [ isEnabled ]);
  
  const { source, invite, version, website, icon, license } = useInternalStore(pluginStore, () => {
    const data: Record<"source" | "invite" | "version" | "website" | "icon" | "license", string | null> = {
      source: null,
      invite: null,
      version: null,
      website: null,
      icon: null,
      license: null
    };

    if (plugin.type === "internal") return data;

    const meta = pluginStore.getMeta(plugin.id);

    data.source = meta.source ?? null;
    data.invite = meta.invite ?? null;
    data.website = meta.website ?? null;
    data.version = pluginStore.getVersionName(plugin.id);
    data.icon = meta.icon ?? null;
    data.license = meta.license ?? null;
    
    return data;
  });

  // Images have no way of sending a event for non ok status???
  useLayoutEffect(() => {
    if (!website) return;
    if (!(internalDataStore.get("show-favicon") ?? true)) return;

    const controller = new AbortController();

    const fetch = window.fetch(generateFaviconURL(website), { mode: "no-cors" });

    fetch.then((res) => {
      if (controller.signal.aborted) return;
      setShowFavicon(res.ok);
    });

    return () => controller.abort();
  }, [ website ]);

  const shouldShowCustomIcon = useMemo(() => Boolean(plugin.type === "custom" && showCustomIcon && icon), [ plugin, showCustomIcon, icon ]);

  return (
    <div className="vx-addon-card" data-vx-type={`${plugin.type}-plugin`} data-vx-addon-id={plugin.id}>
      <div className="vx-addon-top">
        <div 
          className={className([ "vx-addon-icon-wrapper", shouldShowCustomIcon && "vx-addon-icon-img" ])}
          onClick={() => {
            if (!shouldShowCustomIcon) return;
            openImageModal(icon!);
          }}
        >
          {shouldShowCustomIcon ? (
            <img src={icon!} onError={() => setShowCustomIcon(false)} className="vx-addon-icon" />
          ) : (
            <Icons.Code className="vx-addon-icon" height={32} width={32} />
          )}
        </div>
        <div className="vx-addon-details">
          <div className="vx-addon-name">
            <span>
              {plugin.name}
            </span>
            {plugin.requiresRestart && (
              <Tooltip text={Messages.PLUGIN_REQUIRES_RESTART}>
                {(props) => (
                  <span {...props} className={className([ "vx-addon-header-icon", isEnabled !== plugin.getActiveState() && "vx-addon-warn"])}>
                    <Icons.Warn size={16} />
                  </span>
                )}
              </Tooltip>
            )}
            {plugin.id.endsWith(".web") && (
              <Tooltip text={Messages.WEB_ONLY}>
                {(props) => (
                  <span {...props} className="vx-addon-header-icon">
                    <Icons.Globe size={16} />
                  </span>
                )}
              </Tooltip>
            )}
            {plugin.id.endsWith(".app") && (
              <Tooltip text={Messages.APP_ONLY}>
                {(props) => (
                  <span {...props} className="vx-addon-header-icon">
                    <Icons.Desktop size={16} />
                  </span>
                )}
              </Tooltip>
            )}
            {typeof version === "string" && (
              <span className="vx-addon-version">
                {version}
              </span>
            )}
          </div>
          <div className="vx-addon-authors">
            {plugin.authors.map((dev, i) => (
              <AuthorIcon 
                dev={dev}
                isLast={i === (plugin.authors.length - 1)}
                key={`vx-p-${plugin.name}-a-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="vx-addon-description">{plugin.description}</div>
      <div className="vx-addon-divider" />
      <div className="vx-addon-footer">
        {plugin.type === "custom" && (
          <>
            <Tooltip text={Messages.DELETE}>
              {(props) => (
                <Button
                  size={Button.Sizes.ICON}
                  color={Button.Colors.RED}
                  {...props}
                  onClick={(event) => {
                    props.onClick();
    
                    if (event.shiftKey) {
                      pluginStore.delete(plugin.id);
                      return;
                    };
                    
                    openConfirmModal("Are you sure?", [
                      `Are you sure you wan't to delete \`${plugin.name}\` (\`${plugin.id}\`)`,
                      "You cannot recover deleted Themes"
                    ], {
                      confirmText: "Delete",
                      danger: true,
                      onConfirm() {
                        pluginStore.delete(plugin.id);
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
                    openWindow(plugin.id);
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
                    pluginStore.download(plugin.id);
                  }}
                >
                  <Icons.Download />
                </Button>
              )}
            </Tooltip>
          </>
        )}
        <div className="vx-addon-actions">
          {typeof license === "string" && (
            <Tooltip text={Messages.VIEW_LICENSE}>
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={(event) => {
                    props.onClick();

                    let href = `https://choosealicense.com/licenses/${license.toLowerCase()}`;
                    try {
                      href = new URL(license).href;
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
          {typeof website === "string" && (
            <Tooltip text={Messages.VISIT_WEBSITE}>
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={() => {
                    props.onClick();
                    openExternalWindowModal(website);
                  }}
                >
                  {showFavicon ? (
                    <img src={generateFaviconURL(website)} width={24} height={24} className="vx-addon-website" />
                  ) : (
                    <Icons.Globe />
                  )}
                </div>
              )}
            </Tooltip>
          )}
          {typeof invite === "string" && (
            <Tooltip text={Messages.JOIN_SUPPORT_SERVER}>
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={async () => {
                    props.onClick();

                    if (await openInviteModal(invite)) LayerManager.pop();
                  }}
                >
                  <Icons.Discord />
                </div>
              )}
            </Tooltip>
          )}
          {typeof source === "string" && (
            <Tooltip text={Messages.GO_TO_SOURCE}>
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={() => {
                    props.onClick();
                    openExternalWindowModal(source);
                  }}
                >
                  <Icons.Github />
                </div>
              )}
            </Tooltip>
          )}
          {plugin.settings && (
            <Tooltip text={Messages.OPEN_SETTINGS}>
              {(props) => (
                <div
                  {...props}
                  className={className([ "vx-addon-action", !canViewSettings && "vx-addon-disabled" ])}
                  onClick={() => {
                    props.onClick();

                    if (!canViewSettings) return;
                    plugin.settings!();
                  }}
                >
                  <Icons.Gear />
                </div>
              )}
            </Tooltip>
          )}
          <Switch 
            checked={isEnabled}
            onChange={() => {
              setEnabled(plugin.toggle());
            }}
          />
        </div>
      </div>
    </div>
  );
};