import webpack, { filters } from "renderer/webpack";
import { Plugin } from "renderer/addons/plugins";
import { Theme } from "renderer/addons/themes";
import { useStateFromStores } from "renderer/hooks";
import { cache } from "renderer/util";
import { Button, Tooltip } from "renderer/components";
import { createPluginRoute } from "renderer/dashboard/routes";
import { openMenu } from "renderer/menus";
import AddonMenu from "renderer/dashboard/ui/addons/menu";
import { Icons } from "renderer/components";
import native from "renderer/native";
import { AddonIcon } from "renderer/dashboard/ui/addons/icon";
import { openDeleteAddonModal } from "renderer/dashboard/ui/addons/delete";
import { Markdown } from "renderer/components";

const Switch = cache(() => webpack.common.components!.Switch as React.FunctionComponent<{
  checked: boolean,
  onChange: () => void
}>);
const openUserProfileModal = cache(() => webpack.getModule<(opts: { userId: string }) => void>(filters.byStrings(",friendToken:", ".analyticsLocation,"), { searchExports: true })!);

function AddonCard({ addon }: { addon: Theme | Plugin }) {
  const React = webpack.common.React!;

  const enabled = useStateFromStores([ addon ], () => addon.enabled);

  return (
    <div 
      className="vx-addon-card"
      onContextMenu={(event) => openMenu(event, (props) => <AddonMenu addon={addon} props={props} />)}
    >
      <div className="vx-addon-card-header">
        <div className="vx-addon-card-header-left">
          <AddonIcon 
            addon={addon}
            wrapperClassName="vx-addon-card-icon-wrapper"
            spinnerClassName="vx-addon-card-spinner"
            className="vx-addon-card-icon"
          />
        </div>
        <div className="vx-addon-card-header-right">
          <div className="vx-addon-card-info-top">
            <span>{addon.meta.name ?? "???"}</span>
            {" "}
            <span>{addon.meta.version ?? "?.?.?"}</span>
          </div>
          <div 
            onClick={() => {
              if (!addon.meta.authorid) return;

              openUserProfileModal.getter({ userId: addon.meta.authorid });
            }}
            className={`vx-addon-card-info-bottom${addon.meta.authorid ? " vx-selectable" : ""}`}
          >
            {addon.meta.author ?? "No Author"}
          </div>
        </div>
      </div>
      {addon.meta.description && (
        <div className="vx-addon-card-description">
          <Markdown text={addon.meta.description} />
        </div>
      )}
      <div className="vx-addon-card-footer">
        <div className="vx-addon-card-footer-left">
          <Tooltip text="Delete">
            {(props) => (
              <Button
                {...props}
                className="vx-addon-card-delete"
                size={Button.Sizes.ICON}
                color={Button.Colors.RED}
                onClick={() => {
                  props.onClick();
                  openDeleteAddonModal(addon);
                }}
              >
                <Icons.Trash />
              </Button>
            )}
          </Tooltip>
        </div>
        <div className="vx-addon-card-footer-right">
          {addon.meta.source && (
            <Tooltip text="Source">
              {(props) => (
                <div 
                  {...props}
                  className="vx-icon-button"
                  onClick={() => {
                    props.onClick();
                    native.openExternal(addon.meta.source!);
                  }}
                >
                  <Icons.Github />
                </div>
              )}
            </Tooltip>
          )}
          {(addon instanceof Plugin) && typeof addon.exports.Settings === "function" && (
            <Tooltip text="Open Settings">
              {(props) => (
                <div 
                  {...props}
                  className={`vx-icon-button${enabled ? "" : " vx-disabled"}`}
                  onClick={() => {
                    props.onClick();
                    if (!enabled) return;
                    webpack.common.navigation!.transitionTo(
                      createPluginRoute(addon)
                    );
                  }}
                >
                  <Icons.Gear />
                </div>
              )}
            </Tooltip>
          )}
          <Switch.getter
            checked={enabled}
            onChange={() => addon.toggle()}
          />
        </div>
      </div>
    </div>
  )
};

export default AddonCard;