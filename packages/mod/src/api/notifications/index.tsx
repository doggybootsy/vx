import { addPlainTextPatch } from "@webpack/patches";
import { Notifications } from "./notification";
import { notificationStore } from "./store";

import "./index.css";

export interface Notification {
  id?: string,
  title: React.ReactNode | Array<React.ReactNode>,
  icon?(props: { width: number, height: number, className: string }): React.ReactNode,
  type?: "warn" | "warning" | "error" | "danger" | "success" | "positive" | "info",
  description?: React.ReactNode | Array<React.ReactNode>,
  footer?: React.ReactNode,
  duration?: number,
  color?: React.CSSProperties["color"],

  // events
  ref?(div: HTMLDivElement): void,
  onClose?(reason: "user" | "timeout" | "api"): void
};

addPlainTextPatch({
  identifier: "VX(notifications)",
  match: "Shakeable is shaken when not mounted",
  find: /\(0,.{1,3}\.jsxs\)\(.{1,3}\.Shakeable,{ref:.{1,3},className:.{1,3}\.app,children:\[.{50,200}\.DnDKeyboardHelpBar,{}\)\]}\)/,
  replace: "$vxi._handleNotifications($&)"
})

const allowedTypes = new Set([
  "warn", "warning",
  "error", "danger",
  "success", "positive",
  "info"
]);

let counter = 0;
export function openNotification(notification: Notification) {
  if (!notification.id) notification.id = `no-id-${counter++}`;
  if (!notification.title) throw new TypeError("Argument 'options' requires a 'title' field!");
 
  if (notification.type && !allowedTypes.has(notification.type)) throw new TypeError(`Argument 'options' requires a 'type' that is either of ${Array.from(allowedTypes).join(", ")}`);

  notification.duration ??= 3000;

  notificationStore.add(notification.id, notification);

  return () => notificationStore.delete(notification.id!, "api");
}
export function closeNotification(id: string) {
  notificationStore.delete(id, "api");
}

__self__._handleNotifications = function(shakeable: any) {
  return [
    shakeable,
    <Notifications />
  ]
}