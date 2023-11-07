import { openDashboard } from ".";
import { internalDataStore } from "../api/storage";
import { Icons } from "../components";
import { cacheComponent } from "../util";
import { byStrings, combine, getByKeys, not } from "../webpack";
import { React } from "../webpack/common";
import { addPlainTextPatch } from "../webpack/patches";

addPlainTextPatch(
  {
    identifier: "VX(home-button)",
    match: ".default.Messages.GUILDS_BAR_A11Y_LABEL",
    find: /\(.{1,3}\.AdvancedScrollerNone/,
    replace: "(window.VX._self._addHomeButton"
  },
  {
    identifier: "VX(settings-button)",
    match: ".Messages.USER_SETTINGS_WITH_BUILD_OVERRIDE.format({webBuildOverride",
    find: /USER_SETTINGS,onClick:(.{1,3}),/,
    replace: "USER_SETTINGS,onClick:VX._self._settingButtonOnClickWrapper($1),"
  }
);

function HomeButton() {
  return (
    <div
      id="vx-home-button"
      onClick={() => {
        openDashboard();
      }}
    >
      <Icons.Logo />
    </div>
  );
};

export const _addHomeButton = cacheComponent(() => {
  const dmsFilter = byStrings(".AvatarSizes.SIZE_16");
  const Components = getByKeys<any>([ "AdvancedScrollerNone" ]);

  return React.forwardRef((props: { children: React.ReactNode[] }, ref) => {
    const index = props.children.findIndex((child) => React.isValidElement(child) ? dmsFilter(child.type) : false);
  
    if (~index) {    
      props.children.splice(index, 0, <HomeButton />);
    };
      
    return <Components.AdvancedScrollerNone {...props} ref={ref} />
  });
});

export function _settingButtonOnClickWrapper(onClick: (event: React.MouseEvent) => void) {
  const shouldOpen = () => internalDataStore.get("user-setting-shortcut") ?? true;
  
  return (event: React.MouseEvent) => {
    if (event.shiftKey && shouldOpen()) {
      openDashboard();

      return;
    };

    onClick(event);
  };
};
