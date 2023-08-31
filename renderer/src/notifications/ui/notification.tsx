import webpack from "renderer/webpack";

import { notificationStore } from "renderer/notifications/store";
import { Notification } from "renderer/notifications/types";

function Notification({ notification }: { notification: Notification }) {
  const React = webpack.common.React!;

  return (
    <div 
      className={`vx-notification${notification.type ? ` vx-notification-type-${notification.type}` : ""}`}
      data-vx-notification-id={notification.id} 
    >
      <div 
        className="vx-notification-header"
        onMouseDown={(event) => {
          if (event.button !== 1) return;

          notificationStore.delete(notification.id);
        }}
      >
        <div className="vx-notification-info">
          {notification.icon && (
            <div className="vx-notification-icon">
              <notification.icon width={24} height={24} />
            </div>
          )}
          <div className="vx-notification-title">
            {notification.title}
          </div>
        </div>
        <div 
          className="vx-notification-close"
          onClick={() => notificationStore.delete(notification.id)}
          onContextMenu={() => notificationStore.clear()}
        >
          <svg width={18} height={18} viewBox="0 0 24 24">
            <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
          </svg>
        </div>
      </div>
      {notification.description && (
        <div className="vx-notification-description">
          {notification.description}
        </div>
      )}
      {notification.footer && (
        <div className="vx-notification-footer">
          {notification.footer}
        </div>
      )}
    </div>
  )
};

export default Notification;