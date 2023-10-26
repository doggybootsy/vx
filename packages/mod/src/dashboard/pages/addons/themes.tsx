import { Panel } from "../..";
import { openConfirmModal, openUserModal } from "../../../api/modals";
import { Button, Icons, Tooltip, Switch, Flex, FlexChild, Mask } from "../../../components";
import { themes } from "../../../native";
import { Theme, themeStore } from "../../../themes";
import { className, getRandomDefaultAvatar } from "../../../util";
import { useInternalStore, useUser } from "../../../hooks";
import { React, WindowUtil, openUserContextMenu } from "../../../webpack/common";
import { NoAddons } from "./shared";

function AuthorIcon({ theme }: { theme: Theme }) {
  const user = theme.meta.authorid ? useUser(theme.meta.authorid) : null;  

  const randomDefaultAvatar = React.useMemo(() => getRandomDefaultAvatar(), [ ]);

  const backgroundImage = React.useMemo(() => {
    const wrapURL = (url: string) => `url(${JSON.stringify(url)})`;

    if (user) return wrapURL(user.getAvatarURL(undefined, 120, true));
    return wrapURL(randomDefaultAvatar);
  }, [ user ]);  

  return (
    <Mask
      mask="none"
      height={24}
      width={24}
    >
      <Tooltip text={theme.meta.author}>
        {(props) => (
          <div 
            {...props}
            onClick={() => {
              if (!theme.meta.authorid) return;

              openUserModal(theme.meta.authorid);
            }}
            onContextMenu={(event) => {
              props.onContextMenu();

              if (!user) return;
              openUserContextMenu(event, user);
            }}
            className={className([
              "vx-addon-author",
              !theme.meta.authorid && "vx-addon-disabled"
            ])}
            style={{ backgroundImage }} 
          />
        )}
      </Tooltip>
    </Mask>
  );
};

function ThemeCard({ theme }: { theme: Theme }) {
  const [ isEnabled, setEnabled ] = React.useState(() => theme.isEnabled());
  
  return (
    <div className="vx-addon-card">
      <div className="vx-addon-top">
        <div className="vx-addon-icon-wrapper">
          <Icons.Palette className="vx-addon-icon" height={32} width={32} />
        </div>
        <div className="vx-addon-details">
          <div className="vx-addon-name">
            {theme.meta.name}
          </div>
          <div className="vx-addon-authors">
            <AuthorIcon theme={theme} />
          </div>
        </div>
      </div>
      {"description" in theme.meta && (
        <div className="vx-addon-description">{theme.meta.description}</div>
      )}
      <div className="vx-addon-divider" />
      <div className="vx-addon-footer">
        <Tooltip text="Delete">
          {(props) => (
            <Button
              color={Button.Colors.RED}
              size={Button.Sizes.ICON}
              {...props}
              onClick={() => {
                props.onClick();

                openConfirmModal("Are you sure?", [
                  `Are you sure you wan't to delete \`${theme.meta.name}\` (\`${theme.id}\`)`,
                  "Deleted themes should end up in the recycle bin"
                ], {
                  confirmText: "Delete",
                  danger: true,
                  onConfirm() {
                    theme.delete();
                  }
                });
              }}
            >
              <Icons.Trash />
            </Button>
          )}
        </Tooltip>
        <div className="vx-addon-actions">
          {theme.meta.source && (
            <Tooltip text="Source">
              {(props) => (
                <div
                  {...props}
                  className="vx-addon-action"
                  onClick={(event) => {
                    props.onClick();

                    WindowUtil.handleClick({
                      href: theme.meta.source!
                    }, event)
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
              setEnabled(theme.toggle());
            }}
          />
        </div>
      </div>
    </div>
  );
};

export function Themes() {
  const entries = useInternalStore(themeStore, () => Object.entries(themeStore.themes))

  return (
    <Panel 
      title="Themes"
      buttons={
        <>
          <Tooltip text="Refresh Themes">
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();

                  themeStore.loadThemes();
                }}
              >
                <Icons.Refresh />
              </Button>
            )}
          </Tooltip>
          <Tooltip text="Open Folder">
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();
                  themes.open();
                }}
              >
                <Icons.Folder />
              </Button>
            )}
          </Tooltip>
        </>
      }
    >
      <div className="vx-addons-warning">
        <Icons.Warn 
          width={20} 
          height={20} 
          className="vx-addons-icon" 
        />
        <span>
          You need to refresh to see themes that you add / edited
        </span>
      </div>
      <Flex className="vx-addons" direction={Flex.Direction.VERTICAL} gap={8}>
        {entries.length ? entries.map(([ key, theme ]) => (
          <FlexChild key={`vx-t-${key}`} >
            <ThemeCard 
              theme={theme}
            />
          </FlexChild>
        )) : (
          <NoAddons message="No Custom CSS Found" />
        )}
      </Flex>
    </Panel>
  )
};