import webpack from "renderer/webpack";
import { allowedTypes, notificationStore } from "renderer/notifications/store";
import { Notification } from "renderer/notifications/types";
import { Markdown } from "renderer/components";

export * from "./types";

import "./patch";

const queue = new Map<string, Notification>();

webpack.whenReady(() => {
  for (const [, notification] of queue)
    openNotification(notification);
});

export function openNotification(opts: Notification) {
  if (!webpack.isReady) {
    queue.set(opts.id, opts);

    return () => {
      queue.delete(opts.id);
      notificationStore.delete(opts.id);
    };
  };

  const React = webpack.common.React!;

  if (!opts.id) throw new TypeError("Argument 'options' requires a 'id' field!");
  if (!opts.title) throw new TypeError("Argument 'options' requires a 'title' field!");

  opts.duration ??= 3000;

  if (opts.type && !allowedTypes.has(opts.type)) throw new TypeError(`Argument 'options' requires a 'type' that is either of ${Array.from(allowedTypes).join(", ")}`);

  if (opts.description) {
    if (!Array.isArray(opts.description)) opts.description = [ opts.description ];
    opts.description = Array.from(opts.description, (item) => (
      <div className="vx-notification-line">
        {typeof item === "string" ? (
          <Markdown text={item} />
        ) : item}
      </div>
    ));
  };
  
  return notificationStore.add(opts.id, opts);
};
export function closeNotification(id: string) {
  notificationStore.delete(id);
};
