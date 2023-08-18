import { useStateFromStores } from "renderer/hooks";
import webpack from "renderer/webpack";
import Notification from "./notification";
import { notificationStore } from "renderer/notifications/store";

function Notifications() {
  const React = webpack.common.React!;

  const notifs = useStateFromStores([ notificationStore ], () => notificationStore.getState());

  return (
    <div id="vx-notifications">
      {notifs.map((notification) => (
        <Notification notification={notification} key={`vx-notification-${notification.id}`} />
      ))}
    </div>
  )
};

export default Notifications;