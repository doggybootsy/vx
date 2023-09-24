import webpack from "renderer/webpack";

import { notificationStore } from "renderer/notifications/store";
import { Notification } from "renderer/notifications/types";
import storage from "renderer/storage";

interface SpringRef {
  resume(): void,
  pause(): void
};

function Slider({ duration, springRef, close }: { duration: number, springRef: VX.NullableRef<SpringRef>, close: () => void }) {
  const React = webpack.common.React!;
  const ReactSpring = webpack.common.ReactSpring!;

  const props = ReactSpring.useSpring({
    to: { width: "100%" },
    from: { width: "0%" },
    onRest() { close(); },
    config: {
      duration: duration,
      ...ReactSpring.config.default
    }
  });

  React.useLayoutEffect(() => {
    springRef.current = {
      resume() { props.width.resume(); },
      pause() { props.width.pause(); }
    };
  }, [ ]);

  return (
    <div className="vx-notification-slider-wrapper">
      <ReactSpring.animated.div 
        style={{ width: props.width }} 
        className="vx-notification-slider" 
      />
    </div>
  )
};

function shouldDisplaySlider(notification: Notification) {
  return !isNaN(notification.duration!) && isFinite(notification.duration!);
};

function Notification({ notification }: { notification: Notification }) {
  const React = webpack.common.React!;
  const springRef = React.useRef<SpringRef>();

  const displaySlider = shouldDisplaySlider(notification);

  const rightClickCloseAll = storage.use("addons-right-click-close-all", true);

  const onContextMenu = React.useCallback(() => {
    if (!rightClickCloseAll) return;

    notificationStore.clear();
  }, [ rightClickCloseAll ])
  

  return (
    <div 
      className={`vx-notification${notification.type ? ` vx-notification-type-${notification.type}` : ""}`}
      data-vx-notification-id={notification.id}
      onMouseOver={() => {
        if (!springRef.current) return;
        springRef.current.pause();
      }}
      onMouseLeave={() => {
        if (!springRef.current) return;
        springRef.current.resume();
      }}
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
          onContextMenu={onContextMenu}
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
      {displaySlider && (
        <Slider 
          duration={notification.duration!} 
          springRef={springRef} 
          close={() => notificationStore.delete(notification.id)}
        />
      )}
    </div>
  )
};

export default Notification;