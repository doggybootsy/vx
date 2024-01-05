import { useLayoutEffect, useRef } from "react";

import { Notification } from ".";
import { transformContent } from "../../components";
import { useInternalStore } from "../../hooks";
import { ReactSpring } from "@webpack/common"
import { notificationStore } from "./store"

export function Notifications() {
  const state = useInternalStore(notificationStore, () => notificationStore.getState());

  return (
    <div id="vx-notifications">
      {state.map((notification) => (
        <Notification
          notification={notification} 
          key={`vx-notification-${notification.order}`}
        />
      ))}
    </div>
  )
};

function shouldDisplaySlider(notification: Notification) {
  return !isNaN(notification.duration!) && isFinite(notification.duration!);
};

interface SpringRef {
  resume(): void,
  pause(): void,
  reset(): void
};

function Slider({ duration, springRef, close }: { duration: number, springRef: React.MutableRefObject<SpringRef | void>, close: () => void }) {
  const props = ReactSpring.useSpring({
    to: { width: "100%" },
    from: { width: "0%" },
    onRest() { close(); },
    config: {
      duration: duration,
      ...ReactSpring.config.default
    }
  });

  useLayoutEffect(() => {
    springRef.current = {
      resume() { props.width.resume(); },
      pause() { props.width.pause(); },
      reset() { props.width.reset(); }
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

enum MouseButtons {
  LEFT,
  MIDDLE,
  RIGHT
};

function Notification({ notification }: { notification: Notification }) {
  const springRef = useRef<SpringRef | void>();

  const displaySlider = shouldDisplaySlider(notification);

  return (
    <div 
      className={`vx-notification${notification.type ? ` vx-notification-type-${notification.type}` : ""}`}
      data-vx-notification-id={notification.id}
      onMouseOver={() => {
        if (!springRef.current) return;
        
        springRef.current.reset();
        springRef.current.pause();
      }}
      onMouseLeave={(event) => {
        if (!springRef.current) return;
        springRef.current.resume();
      }}
      ref={notification.ref}
    >
      <div 
        className="vx-notification-header"
        onMouseDown={(event) => {
          if (event.button !== MouseButtons.MIDDLE) return;

          notificationStore.delete(notification.id);
        }}
      >
        <div className="vx-notification-info">
          {notification.icon && (
            <div className="vx-notification-icon">
              <notification.icon width={24} height={24} className="vx-notification-title" />
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
          {transformContent(notification.description, "vx-notification-line")}
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