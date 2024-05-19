import { Messages } from "vx:i18n";
import { InfoSection, openDashboard } from "..";
import { MenuComponents, closeMenu, openMenu } from "../../api/menu";
import { Icons } from "../../components";
import { IS_DESKTOP } from "vx:self";

export function HomeMenu() {
  return (
    <MenuComponents.Menu navId="vx-home-menu" onClose={() => closeMenu()}>
      <MenuComponents.MenuGroup label={Messages.VX}>
        <MenuComponents.MenuItem 
          id="home"
          label={Messages.HOME}
          icon={Icons.Logo}
          action={() => openDashboard("home")}
        />
      </MenuComponents.MenuGroup>
      <MenuComponents.MenuGroup label={Messages.ADDONS}>
        <MenuComponents.MenuItem 
          id="themes"
          label={Messages.THEMES}
          icon={Icons.Palette}
          action={() => openDashboard("themes")}
        />
        <MenuComponents.MenuItem 
          id="plugins"
          label={Messages.PLUGINS}
          icon={Icons.Code}
          action={() => openDashboard("plugins")}
        />
      </MenuComponents.MenuGroup>
      {IS_DESKTOP && (
        <MenuComponents.MenuGroup label={Messages.DESKTOP}>
          <MenuComponents.MenuItem 
            id="extensions"
            icon={Icons.Puzzle}
            label={Messages.EXTENSIONS}
            action={() => openDashboard("extensions")}
          />
        </MenuComponents.MenuGroup>
      )}
      <MenuComponents.MenuGroup>
        <MenuComponents.MenuItem 
          id="info"
          render={() => <InfoSection isMenu />}
          keepItemStyles={false}
        />
      </MenuComponents.MenuGroup>
    </MenuComponents.Menu>
  )
}

export function HomeButton() {
  return (
    <div
      id="vx-home-button"
      onClick={() => {
        openDashboard();
      }}
      onContextMenu={(event) => {
        openMenu(event, HomeMenu);
      }}
      role="button"
      aria-label="Open VX Dashboard"
      tabIndex={-1}
    >
      <Icons.Logo />
    </div>
  )
}