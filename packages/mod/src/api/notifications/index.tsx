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

  // events
  ref?(div: HTMLDivElement): void,
  onClose?(reason: "user" | "timeout" | "api"): void
};

addPlainTextPatch({
  identifier: "VX(notifications)",
  match: "!this.state.shaking)this.setState({shaking:!0},this._animate)",
  find: /let{children:.{1,3},\.{3}t}=this\.props;return\(0,.{1,3}\.jsx\)\("div",{\.{3}.{1,3},ref:this\.ref,children:.{1,3}}\)/,
  replace: "$vx.notifications._handleNotifications(this.props);$&"
});

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

// CSS ClassName normalizing breaks this so, add a check for a normalized name
const appClassNameRegex = /^app_.{6}( app)?$/;
export function _handleNotifications(props: any) {
  if (!appClassNameRegex.test(String(props.className))) return;
  
  props.children.push(
    <Notifications />
  );
}