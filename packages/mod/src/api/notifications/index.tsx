import { plainTextPatches } from "../../webpack/patches";
import { Notifications } from "./notification";
import { notificationStore } from "./store";

import "./index.css";
import { _handleRoutes } from "../../dashboard";

export interface Notification {
  id: string,
  title: React.ReactNode | Array<React.ReactNode>,
  icon?(props: { width: number, height: number, className: string }): React.ReactNode,
  type?: "warn" | "warning" | "error" | "danger" | "success" | "positive" | "info",
  description?: React.ReactNode | Array<React.ReactNode>,
  footer?: React.ReactNode,
  duration?: number,

  // events
  onMouseOver?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void,
  onMouseLeave?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void,
  onClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void,
  onContextMenu?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void,
  ref?(div: HTMLDivElement): void
};

plainTextPatches.push({
  identifier: "VX(notifications)",
  match: ".Messages.BILLING_SWITCH_PLAN_UPGRADE",
  replacements: [
    {
      find: /(function .{1,3}\((.{1,3})\){)(var .{1,3}=.{1,3}\.children,.{1,3}=.{1,3}\(.{1,3}\.useState\(null\),2\))/,
      replace: "$1window.VX.notifications._handleNotifications($2);$3"
    }
  ]
});

const allowedTypes = new Set([
  "warn", "warning",
  "error", "danger",
  "success", "positive",
  "info"
]);

export function openNotification(notification: Notification) {
  if (!notification.id) throw new TypeError("Argument 'options' requires a 'id' field!");
  if (!notification.title) throw new TypeError("Argument 'options' requires a 'title' field!");
 
  if (notification.type && !allowedTypes.has(notification.type)) throw new TypeError(`Argument 'options' requires a 'type' that is either of ${Array.from(allowedTypes).join(", ")}`);

  notification.duration ??= 3000;

  notificationStore.add(notification.id, notification);

  return () => notificationStore.delete(notification.id);
};
export function closeNotification(id: string) {
  notificationStore.delete(id);
};

export function _handleNotifications(props: any) {
  const { children } = props.children.props.children.props;
  
  children.push(
    <Notifications />
  );
};