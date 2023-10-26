import ErrorBoundary from "./boundary";
import * as Icons from "./icons";

const WrappedIcons = Object.fromEntries(Object.entries(Icons).map(([ key, Icon ]) => [ key, ErrorBoundary.wrap(Icon) ])) as typeof Icons;

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