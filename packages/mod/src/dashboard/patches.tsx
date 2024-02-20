import { forwardRef, isValidElement, useLayoutEffect, useState } from "react";

import { isDashboardOpen, openDashboard } from ".";
import { internalDataStore } from "../api/storage";
import { Icons } from "../components";
import { cache, className } from "../util";
import { byStrings, getByKeys, whenWebpackInit } from "@webpack";
import { addPlainTextPatch } from "@webpack";
import { env } from "vx:self";
import { GuildClock } from "../plugins/guild-clock";

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
  },
  {
    identifier: "VX(titlebar)",
    match: ".wordmarkWindows,",
    find: /(,.{1,3}=(.{1,3})=>{let.+?\.default,{}\)}\),.+?)\]/,
    replace: "$1,$react.createElement($vx._self.TitlebarButton,$2)]"
  }
);

function HomeButton() {
  return (
    <div
      id="vx-home-button"
      onClick={() => {
        openDashboard();
      }}
      role="button"
      aria-label="Open VX Dashboard"
      tabIndex={-1}
    >
      <Icons.Logo />
    </div>
  );
}

export function TitlebarButton(props: { windowKey?: string }) {
  const [ loading, setLoading ] = useState(true);
  const isOpen = isDashboardOpen();

  useLayoutEffect(() => {
    const controller = new AbortController();
    
    whenWebpackInit().then(() => {
      if (controller.signal.aborted) return;
      setLoading(false);
    });

    return () => controller.abort();
  }, [ ]);
  
  if (typeof props.windowKey === "string") return;

  return (
    <div 
      className={className([ "vx-titlebar-button", loading && "vx-titlebar-loading", (loading || isOpen) && "vx-titlebar-disabled" ])}
      aria-label="Open VX Dashboard" 
      title={`VX v${env.VERSION}`}
      tabIndex={-1} 
      role="button"
      onClick={() => {
        if (loading) return;
        openDashboard();
      }}
    >
      <Icons.Logo size={20} />
    </div>
  )
}

export const _addHomeButton = cache(() => {
  const dmsFilter = byStrings(".AvatarSizes.SIZE_16");
  const Components = getByKeys<any>([ "AdvancedScrollerNone" ]);

  return forwardRef((props: { children: React.ReactNode[] }, ref) => {
    const children = props.children.concat();

    const index = children.findIndex((child) => isValidElement(child) ? dmsFilter(child.type) : false);
    
    if (~index) {      
      children.splice(
        index, 
        0, 
        <HomeButton />, 
        // No need to make a new patch
        <GuildClock />
      );
    }
    
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
    }

    onClick(event);
  };
}