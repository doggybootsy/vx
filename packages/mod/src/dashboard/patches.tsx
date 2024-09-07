import { forwardRef, isValidElement, useLayoutEffect, useState } from "react";

import { openDashboard } from ".";
import { internalDataStore } from "../api/storage";
import { Icons } from "../components";
import { className } from "../util";
import { byStrings, getByKeys, webpackRequire, whenWebpackInit } from "@webpack";
import { addPlainTextPatch } from "@webpack";
import { env } from "vx:self";
import { GuildClock } from "../plugins/guild-clock";
import { HomeButton, HomeMenu } from "./button";
import { openMenu } from "../api/menu";
import { GuildDmTypingIndicator } from "../plugins/better-typing-indicators";
import { nativeFrame } from "../native";
import { NavigationPanel } from "./navigational";

addPlainTextPatch(
  {
    identifier: "VX(home-button)",
    match: ".Messages.GUILDS_BAR_A11Y_LABEL",
    find: /\((.{1,3}\.AdvancedScrollerNone)/,
    replace: "($vxi._addHomeButton()"
  },
  {
    identifier: "VX(settings-button)",
    match: ".Messages.USER_SETTINGS_WITH_BUILD_OVERRIDE.format({webBuildOverride",
    find: /USER_SETTINGS,onClick:(.{1,3}),onContextMenu:(.{1,3}),/,
    replace: "USER_SETTINGS,onClick:$vxi._settingButtonActionWrapper($1,false),onContextMenu:$vxi._settingButtonActionWrapper($2,true),"
  },
  {
    identifier: "VX(titlebar)",
    match: ".wordmarkWindows,",
    replacements: [
      {
        find: /(,.{1,3}=(.{1,3})=>{let.+?\.(?:default|Z|ZP),{}\)}\),.+?)\]/,
        replace: "$1,$jsx($vxi.TitlebarButton,$2)]"
      },
      // this patch is impossible to undo so it, it breaks the normal rules
      {
        find: /(function .{1,3}\(.{1,3}\){)(let{focused:.{1,3},)/,
        replace: "$1return null;$2",
        predicate: () => nativeFrame.get()
      }
    ]
  },
  {
    identifier: "VX(routes)",
    match: '.SETTINGS(":section",":subsection?")',
    find: /(let .{1,3})=(\[{path:\[.{1,3}\..{1,3}\.APP_WITH_INVITE_AND_GUILD_ONBOARDING)/,
    replace: "$1=$vxi.routes=$2"
  }, 
  {
    identifier: "VX(route)",
    match: "app view user trigger debugging",
    find: /(children:)\[(\(0,.{1,3}\.jsx\)\((.{1,3}\..{1,3}),{path:.{1,3}\..{1,3}\.ACTIVITY,disableTrack)/,
    replace: "$1[$jsx($3,$vxi.dashboardRouteProps),$2"
  }, 
  {
    identifier: "VX(navigation)",
    match: "app view user trigger debugging",
    find: /(\.hidden\]:.{1,3}}\),children:)\[(\(0,.{1,3}\.jsx\)\(.{1,3},{}\))/,
    replace: "$1[$jsx($vxi.NavigationPanel,{panel:$2})"
  }
);

__self__.NavigationPanel = function({ panel }: { panel: React.ReactNode }) {
  if (location.pathname.startsWith("/vx")) {
    return <NavigationPanel />;
  }
  return panel;
};

__self__.TitlebarButton = function TitlebarButton(props: { windowKey?: string }) {
  const [ loading, setLoading ] = useState(() => typeof webpackRequire !== "function");

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
      className={className([ "vx-titlebar-button", loading && "vx-titlebar-loading", (loading) && "vx-titlebar-disabled" ])}
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
};

__self__._addHomeButton = cache(() => {
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

__self__._settingButtonActionWrapper = function _settingButtonActionWrapper(action: (event: React.MouseEvent) => void, isOnContextMenu: boolean) {
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
};