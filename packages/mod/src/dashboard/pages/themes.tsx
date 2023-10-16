import { Panel } from "..";
import { openUserModal } from "../../api/modals";
import { Button, Icons, Tooltip, Switch, Flex, FlexChild, Mask } from "../../components";
import { themes } from "../../native";
import { Theme, themeStore } from "../../themes";
import { className, getRandomDefaultAvatar } from "../../util";
import { React, useUser } from "../../webpack/common";

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

  theme.meta.authorid
  
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
            >
              <Icons.Trash />
            </Button>
          )}
        </Tooltip>
        <div className="vx-addon-actions">
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
  const themeKeys = Object.keys(themeStore.themes);

  return (
    <Panel 
      title="Themes"
      buttons={
        <>
          <Tooltip text="Open Folder">
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.ICON} 
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
      <Flex className="vx-addons" direction={Flex.Direction.VERTICAL} gap={8}>
        {themeKeys.map((key) => (
          <FlexChild key={`vx-t-${key}`} >
            <ThemeCard theme={themeStore.themes[key]} />
          </FlexChild>
        ))}
      </Flex>
    </Panel>
  )
};