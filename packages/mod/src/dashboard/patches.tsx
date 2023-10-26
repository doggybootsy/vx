import { openDashboard } from ".";
import { internalDataStore } from "../api/storage";
import { Icons } from "../components";
import { byStrings } from "../webpack";
import { React } from "../webpack/common";
import { addPlainTextPatch } from "../webpack/patches";

addPlainTextPatch(
  {
    identifier: "VX(home-button)",
    find: /(containerRef:.{1,3},children:)\[(.{1,3}),(.{1,3})\]/,
    replace: "$1[window.VX._self._addHomeButton($2),$3]"
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

const seperatorFilter = byStrings(".guildSeparator");
export function _addHomeButton(children: React.ReactNode[]) {
  if (!Array.isArray(children)) return children;
  
  const index = children.findIndex((child) => React.isValidElement(child) ? seperatorFilter(child.type) : false);
  
  if (~index) {
    children.splice(index - 1, 0, <HomeButton />);
  };

  return children;
};

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
