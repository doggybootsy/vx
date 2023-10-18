import { openUserModal } from "../../../api/modals";
import { Icons, Mask, Tooltip, Switch } from "../../../components";
import { Developer } from "../../../constants";
import { Plugin } from "../../../plugins";
import { className, getRandomDefaultAvatar } from "../../../util";
import { React, openUserContextMenu, useUser } from "../../../webpack/common";
import { openPluginSettingsModal } from "./modal";

function AuthorIcon({ dev, isLast }: { dev: Developer, isLast: boolean }) {
  const user = useUser(dev.discord);

  const randomDefaultAvatar = React.useMemo(() => getRandomDefaultAvatar(), [ ]);

  const backgroundImage = React.useMemo(() => {
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

export function PluginCard({ plugin }: { plugin: Plugin }) {
  const [ isEnabled, setEnabled ] = React.useState(() => plugin.isEnabled());
  
  return (
    <div className="vx-addon-card">
      <div className="vx-addon-top">
        <div className="vx-addon-icon-wrapper">
          <Icons.Code className="vx-addon-icon" height={32} width={32} />
        </div>
        <div className="vx-addon-details">
          <div className="vx-addon-name">
            {plugin.name}
          </div>
          <div className="vx-addon-authors">
            {plugin.exports.authors.map((dev, i) => (
              <AuthorIcon 
                dev={dev}
                isLast={i === (plugin.exports.authors.length - 1)}
                key={`vx-p-${plugin.name}-a-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="vx-addon-description">{plugin.exports.description}</div>
      <div className="vx-addon-divider" />
      <div className="vx-addon-footer">
        <div className="vx-addon-actions">
          {plugin.exports.settings && (
            <Tooltip text="Open Settings">
              {(props) => (
                <div
                  {...props}
                  className={className([ "vx-addon-action", !isEnabled && "vx-addon-disabled" ])}
                  onClick={() => {
                    props.onClick();

                    if (!isEnabled) return;
                    openPluginSettingsModal(plugin);
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