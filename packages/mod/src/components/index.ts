import ErrorBoundary from "./boundary";
import * as Icons from "./icons";

const WrappedIcons = Object.fromEntries(Object.entries(Icons).map(([ key, Icon ]) => [ key, ErrorBoundary.wrap(Icon) ])) as typeof Icons;

WrappedIcons.DiscordIcon.getAll = Icons.DiscordIcon.getAll;

export { WrappedIcons as Icons };

export * from "./tooltip";
export * from "./markdown";
export * from "./button";
export * from "./mask";
export * as MiniPopover from "./minipopover";
export { default as ErrorBoundary } from "./boundary";
export * from "./flex";
export * from "./collapsable";
export * from "./switch";
export * from "./colorpicker";
export * from "./form";
export * from "./settingsView";
export * from "./spinner";
export * from "./searchBar";
export * from "./popout";
export * from "./util";
export * from "./textOverflowScroller";
export * from "./html";
export * from "./userPopout";