import { Messages } from "vx:i18n";
import { InfoSection, openDashboard } from "..";
import { MenuComponents, closeMenu, openMenu } from "../../api/menu";
import { Icons } from "../../components";
import { IS_DESKTOP } from "vx:self";
import { useInternalStore } from "../../hooks";
import { updaterStore } from "../pages/home/updater";

export function HomeMenu() {
  return (
    <MenuComponents.Menu navId="vx-home-menu" onClose={() => closeMenu()}>
      <MenuComponents.MenuGroup label={Messages.VX}>
        <MenuComponents.MenuItem 
          id="home"
          label={Messages.HOME}
          icon={Icons.Logo}
          action={() => openDashboard("/home")}
        />
      </MenuComponents.MenuGroup>
      <MenuComponents.MenuGroup label={Messages.ADDONS}>
        <MenuComponents.MenuItem 
          id="themes"
          label={Messages.THEMES}
          icon={Icons.Palette}
          action={() => openDashboard("/themes")}
        />
        <MenuComponents.MenuItem 
          id="plugins"
          label={Messages.PLUGINS}
          icon={Icons.Code}
          action={() => openDashboard("/plugins")}
        />
      </MenuComponents.MenuGroup>
      <MenuComponents.MenuGroup label="Community">
        <MenuComponents.MenuItem 
          id="community-themes"
          label={Messages.THEMES}
          icon={Icons.Palette}
          action={() => openDashboard("/community/themes")}
        />
      </MenuComponents.MenuGroup>
      {IS_DESKTOP && (
        <MenuComponents.MenuGroup label={Messages.DESKTOP}>
          <MenuComponents.MenuItem 
            id="extensions"
            icon={Icons.Puzzle}
            label={Messages.EXTENSIONS}
            action={() => openDashboard("/extensions")}
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
  const hasUpdate = useInternalStore(updaterStore, () => updaterStore.getState().compared === -1);  

  return (
    <div
      id="vx-home-button"
      data-has-update={hasUpdate.toString()}
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
      <svg
        height={32}
        width={48}
        viewBox={`0 0 48 32`}
      >
        <defs>
          <rect id="vx-home-button-blob" width="48" height="32" />
          <rect id="vx-home-button-badge" x={hasUpdate ? 28 : 48} y="-4" width="24" height="24" rx="12" ry="12" transform="translate(0 0)" />
        </defs>
        <mask id="vx-home-button-mask" x={0} y={0} width={48} height={32} fill="black">
          <use href="#vx-home-button-blob" fill="white" />
          <use href="#vx-home-button-badge" fill="black" />
        </mask>
        <foreignObject
          mask="url(#vx-home-button-mask)"
          height={32}
          width={48}
          x={0}
          y={0}
        >
          <div id="vx-home-button-inner">
            <Icons.Logo />
          </div>
        </foreignObject>
      </svg>
      <div id="vx-home-button-update">
        <div id="vx-home-button-update-inner">
          <Icons.Notice />
        </div>
      </div>
    </div>
  )
}