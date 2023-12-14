import { forwardRef, isValidElement } from "react";

import { openDashboard } from ".";
import { internalDataStore } from "../api/storage";
import { Icons } from "../components";
import { cache } from "../util";
import { byStrings, getByKeys } from "../webpack";
import { addPlainTextPatch } from "../webpack";

addPlainTextPatch(
  {
    identifier: "VX(home-button)",
    match: ".default.Messages.GUILDS_BAR_A11Y_LABEL",
    find: /\((.{1,3}\.AdvancedScrollerNone)/,
    replace: "($vx._self._addHomeButton()"
  },
  {
    identifier: "VX(settings-button)",
    match: ".Messages.USER_SETTINGS_WITH_BUILD_OVERRIDE.format({webBuildOverride",
    find: /USER_SETTINGS,onClick:(.{1,3}),/,
    replace: "USER_SETTINGS,onClick:$vx._self._settingButtonOnClickWrapper($1),"
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

export const _addHomeButton = cache(() => {
  const dmsFilter = byStrings(".AvatarSizes.SIZE_16");
  const Components = getByKeys<any>([ "AdvancedScrollerNone" ]);

  return forwardRef((props: { children: React.ReactNode[] }, ref) => {
    const children = props.children.concat();

    const index = children.findIndex((child) => isValidElement(child) ? dmsFilter(child.type) : false);
    
    if (~index) {
      children.splice(index, 0, <HomeButton />);
    };
    
    return (
      <Components.AdvancedScrollerNone {...props} ref={ref}>
        {children}
      </Components.AdvancedScrollerNone>
    );
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
