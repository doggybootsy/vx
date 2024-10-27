import { addPlainTextPatch } from "@webpack/patches";

import {notificationStore} from "./store";
import {Notifications} from "./notification";

import "./index.css";

export interface Notification {
  id?: string,
  title: React.ReactNode | Array<React.ReactNode>,
  icon?(props: { width: number, height: number, className: string }): React.ReactNode,
  type?: "warn" | "warning" | "error" | "danger" | "success" | "positive" | "info",
  description?: React.ReactNode | Array<React.ReactNode>,
  footer?: React.ReactNode,
  duration?: number,
  sliderColor?: React.CSSProperties["color"],
  textColor?: React.CSSProperties["color"],
  onQueued?: (wasQueued: boolean) => void,
  queueTime?: number,
  wasQueued?: boolean,

  // events
  ref?(div: HTMLDivElement): void,
  onClose?(reason: "user" | "timeout" | "api"): void
};

interface QueuedNotification {
  notification: Notification;
  timestamp: number;
}

class NotificationQueue {
  static queue: QueuedNotification[] = [];
  private static isProcessing: boolean = false;
  private static processInterval: NodeJS.Timeout | null = null;
  private static readonly PROCESS_DELAY = 3000;

  static enqueue(notification: Notification) {
    const timestamp = Date.now();
    notification.queueTime = timestamp;
    notification.wasQueued = true;

    this.queue.push({
      notification,
      timestamp
    });

    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  static startProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processInterval = setInterval(() => {
      if (document.hidden || this.queue.length === 0) {
        if (this.queue.length === 0) {
          this.stopProcessing();
        }
        return;
      }

      const queuedNotification = this.queue.shift();
      if (queuedNotification) {
        const queueDelay = Date.now() - queuedNotification.timestamp;
        const originalTitle = queuedNotification.notification.title;
        queuedNotification.notification.title = (
            <div>
              {originalTitle}
                <div style={{
                  fontSize: '0.8em',
                  opacity: 0.7,
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '50%',
                    marginRight: '2px'
                  }}/>
                Delayed notification ({Math.round(queueDelay / 1000)})s
              </div>
            </div>
        );
        displayNotification(queuedNotification.notification);
      }
    }, this.PROCESS_DELAY);
  }

  static stopProcessing() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    this.isProcessing = false;
  }

  static clearQueue() {
    this.queue = [];
    this.stopProcessing();
  }
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && NotificationQueue.queue.length > 0) {
    NotificationQueue.startProcessing();
  }
});

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

function displayNotification(notification: Notification) {
  if (!notification.id) notification.id = `no-id-${counter++}`;
  if (!notification.title) throw new TypeError("Argument 'options' requires a 'title' field!");

  if (notification.type && !allowedTypes.has(notification.type)) {
    throw new TypeError(`Argument 'options' requires a 'type' that is either of ${Array.from(allowedTypes).join(", ")}`);
  }

  notification.duration ??= 3000;

  notificationStore.add(notification.id, notification);
  return () => notificationStore.delete(notification.id!, "api");
}

export function openNotification(notification: Notification) {
  const wasQueued = document.hidden;

  if (notification.onQueued) {
    notification.onQueued(wasQueued);
  }

  if (wasQueued) {
    NotificationQueue.enqueue(notification);
    return () => {
      NotificationQueue.queue = NotificationQueue.queue.filter(
          queuedNotification => queuedNotification.notification !== notification
      );
      if (notification.id) {
        notificationStore.delete(notification.id, "api");
      }
    };
  }

  return displayNotification(notification);
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

const cleanup = () => { // thisll be used somewhere.
  NotificationQueue.clearQueue();
  document.removeEventListener('visibilitychange', NotificationQueue.startProcessing);
};