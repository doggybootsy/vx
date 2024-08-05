import { forwardRef, isValidElement, useLayoutEffect, useState } from "react";

import { isDashboardOpen, openDashboard } from ".";
import { internalDataStore } from "../api/storage";
import { Icons } from "../components";
import { cache, className } from "../util";
import { byStrings, getByKeys, webpackRequire, whenWebpackInit } from "@webpack";
import { addPlainTextPatch } from "@webpack";
import { env } from "vx:self";
import { GuildClock } from "../plugins/guild-clock";
import { HomeButton, HomeMenu } from "./button";
import { openMenu } from "../api/menu";
import { GuildDmTypingIndicator } from "../plugins/better-typing-indicators";

addPlainTextPatch(
  {
    identifier: "VX(home-button)",
    match: ".Messages.GUILDS_BAR_A11Y_LABEL",
    find: /\((.{1,3}\.AdvancedScrollerNone)/,
    replace: "($vx._self._addHomeButton()"
  },
  {
    identifier: "VX(settings-button)",
    match: ".Messages.USER_SETTINGS_WITH_BUILD_OVERRIDE.format({webBuildOverride",
    find: /USER_SETTINGS,onClick:(.{1,3}),onContextMenu:(.{1,3}),/,
    replace: "USER_SETTINGS,onClick:$vx._self._settingButtonActionWrapper($1,false),onContextMenu:$vx._self._settingButtonActionWrapper($2,true),"
  },
  {
    identifier: "VX(titlebar)",
    match: ".wordmarkWindows,",
    find: /(,.{1,3}=(.{1,3})=>{let.+?\.(?:default|Z|ZP),{}\)}\),.+?)\]/,
    replace: "$1,$jsx($vx._self.TitlebarButton,$2)]"
  }
);

export function TitlebarButton(props: { windowKey?: string }) {
  const [ loading, setLoading ] = useState(() => typeof webpackRequire !== "function");
  const isOpen = isDashboardOpen();

  useLayoutEffect(() => {
    const controller = new AbortController();
    
    whenWebpackInit().then(() => {
      if (controller.signal.aborted) return;
      setLoading(false);
    });

    return () => controller.abort();
  }, [ ]);  

  if (!internalDataStore.use("vx-titlebar")) return;
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
        <GuildClock />,
        <GuildDmTypingIndicator />
      );
    }
    
    return (
      <Components.AdvancedScrollerNone {...props} ref={ref}>
        {children}
      </Components.AdvancedScrollerNone>
    );
  });
});

export function _settingButtonActionWrapper(action: (event: React.MouseEvent) => void, isOnContextMenu: boolean) {
  const shouldOpen = () => internalDataStore.get("user-setting-shortcut") ?? true;
  
  return (event: React.MouseEvent) => {
    // Only run if shift is pressed
    if (event.shiftKey && shouldOpen()) {
      if (isOnContextMenu) {
        openMenu(event, HomeMenu);
        return;
      }

      openDashboard();
      return;
    }

    return action(event);
  }
}