import { useStateFromStores } from "renderer/hooks";
import webpack from "renderer/webpack";
import Notification from "./notification";
import { notificationStore } from "renderer/notifications/store";
import storage from "renderer/storage";

function Notifications() {
  const React = webpack.common.React!;

  const notifs = useStateFromStores([ notificationStore ], () => notificationStore.getState());
  const enabled = storage.use("notifications-enabled", true);

  return (
    <>
      {enabled && (
        <div id="vx-notifications">
          {notifs.map((notification) => (
            <Notification 
              notification={notification} 
              key={`vx-notification-${notification.order}`}
            />
          ))}
        </div>
      )}
    </>
  )
};

export default Notifications;