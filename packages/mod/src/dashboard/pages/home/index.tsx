import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IS_DESKTOP } from "vx:self";
import { Page } from "../..";
import { internalDataStore } from "../../../api/storage";
import { Button, Collapsable, Flex, Icons, Spinner } from "../../../components";
import { FormSwitch } from "../../../components/switch";
import { app, nativeFrame, transparency } from "../../../native";
import { Updater } from "./updater";
import { Messages } from "vx:i18n";
import { openConfirmModal } from "../../../api/modals";
import { getRandomItem, lazy, makeLazy } from "../../../util";
import { getLazy } from "@webpack";
import { closeNotification, openNotification } from "../../../api/notifications";
import { IconFullProps, IconProps } from "../../../components/icons";

const backgrounds = [
  "3og0IFrHkIglEOg8Ba",
  "3ohzAN9PzGgxpQaiM8",
  "sJvz8Qnfly3BOuotGx",
  "3og0INtldac8gncQO4",
  "WUyQbeKHhpaHrrKJu6",
  "l1KXtGiWieAhji91u",
  "l3c614V12UA82q1vG",
  "TZf4ZyXb0lXXi",
  "3og0IV7MOCfnm85iRa",
  "xT9IgusfDcqpPFzjdS",
  "xT39CTrFW4nHLdBPpu",
  "Fbox1ygIqnga5dLinz",
  "l5JbspfwZ0yjHjlJ0K",
  "xUPGcfzaX9hFFQJYre",
  "aN9GqoR7OD3nq"
];

const NotificationSettings = (() => {
  const positions = {
    TOP_LEFT: "topLeft",
    TOP_RIGHT: "topRight",
    BOTTOM_LEFT: "bottomLeft",
    BOTTOM_RIGHT: "bottomRight",
    DISABLED: "disabled"
  } as const;

  type Positions = (typeof positions)[keyof typeof positions];

  interface NotificationSettingsProps {
    onChange(event: React.MouseEvent, position: Positions): void,
    position: Positions
  }

  const NotificationSettingsLazy = makeLazy({
    async factory() {
      await __self__.preloadSettingsView();
      return getLazy<React.ComponentType<NotificationSettingsProps>>(m => m.Positions && !m.getDerivedStateFromProps);
    },
    fallback() {
      return <Spinner />;
    }
  });

  function NotificationSettings(props: NotificationSettingsProps) {
    return <NotificationSettingsLazy {...props} />;
  }
  NotificationSettings.Positions = positions;

  return NotificationSettings;
})();

class DummyNotification {
  private get type() {
    return getRandomItem([ undefined, "warn", "warning", "error", "danger", "success", "positive", "info" ] as const);
  }
  private get icon() {
    const key = getRandomItem([ undefined, ...Object.keys(Icons) ] as const);
    if (!key) return;
    if (key === "DiscordIcon") return;

    return Icons[key as keyof typeof Icons] as (props: IconProps) => React.JSX.Element;
  }
  private isOpen = false;
  public open() {
    this.isOpen = true;
    
    openNotification({
      id: "vx-dummy-notification",
      duration: Infinity,
      icon: this.icon,
      title: "Dummy Notification",
      description: "This is a example notification",
      footer: "It will close when you collapse notification section",
      type: this.type,
      onClose: (reason) => {        
        if (reason === "api") return;
        setTimeout(() => {
          if (!this.isOpen) return;
          this.open();
        }, 75);
      }
    })
  }
  public close() {
    this.isOpen = false;

    closeNotification("vx-dummy-notification");
  }
}

const dummyNotification = new DummyNotification();

interface CategoryProps {
  icon: React.ComponentType<IconFullProps>,
  title: string,
  subtitle: string,
  onClose?(): void,
  onOpen?(): void,
  defaultOpenState?: boolean,
  children: React.ReactNode
}
function Category(props: CategoryProps) {
  const [ isOpen, setOpen ] = useState(props.defaultOpenState || false);

  return (
    <div className="vx-category" data-is-open={String(isOpen)}>
      <div
        className="vx-category-header"
        onClick={() => {
          setOpen(!isOpen);
          if (isOpen) props.onClose?.();
          else props.onOpen?.();
        }}
      >
        <div className="vx-category-icon-wrapper">
          <props.icon width={32} height={32} className="vx-category-icon" />
        </div>
        <div className="vx-category-info">
          <div className="vx-category-title">
            {props.title}
          </div>
          <div className="vx-category-subtitle">
            {props.subtitle}
          </div>
        </div>
        <div className="vx-category-caret">
          <Icons.DiscordIcon name="ChevronLargeLeftIcon" />
        </div>
      </div>
      {isOpen && (
        <>
          <div className="vx-category-seperator" />
          <div className="vx-category-body">
            {props.children}
          </div>
        </>
      )}
    </div>
  )
}

export function Home() {
  const [ contentProtection, setContentProtection ] = useState(() => internalDataStore.get("content-protection") ?? false);
  const [ userSettingShortcut, setUserSettingShortcut ] = useState(() => internalDataStore.get("user-setting-shortcut") ?? true);
  const [ preserveQuery, setPreserveQuery ] = useState(() => internalDataStore.get("preserve-query") ?? true);
  const [ showFavicon, setShowFavicon ] = useState(() => internalDataStore.get("show-favicon") ?? true);
  const [ addVXTitleBarButton, setVXTitleBarButton ] = useState(() => internalDataStore.get("vx-titlebar") ?? false);
  const [ notificationPosition, setNotificationPosition ] = useState(() => internalDataStore.get("notification-position") ?? NotificationSettings.Positions.BOTTOM_RIGHT);

  const [ background, setBackground ] = useState(() => getRandomItem(backgrounds));

  const changeBackground = useCallback(() => {
    const newBackgrounds = new Set(backgrounds);
    newBackgrounds.delete(background);

    setBackground(getRandomItem([ ...newBackgrounds ]));
  }, [ background ]);

  useEffect(() => {
    return () => {
      dummyNotification.close();
    }
  }, [ ]);

  return (
    <Page title="Home" icon={Icons.Logo} transparent>
      <div className="vx-home-header">
        <div className="vx-home-logo" onClick={changeBackground}>
          <video src={`https://media0.giphy.com/media/${background}/giphy.mp4`} muted autoPlay loop />
          <Icons.Logo size={60} />
        </div>
        <Flex className="vx-home-body" justify={Flex.Justify.BETWEEN} direction={Flex.Direction.VERTICAL}>
          <div className="vx-home-welcome">
            {Messages.WELCOME}
          </div>
          <Flex justify={Flex.Justify.START} gap={6} grow={0}>
            <Button onClick={() => location.reload()}>
              {Messages.RELOAD_DISCORD}
            </Button>
            {IS_DESKTOP && (
              <Button onClick={() => app.restart()}>
                {Messages.RESTART_DISCORD}
              </Button>
            )}
            {IS_DESKTOP && (
              // Web api prevents you from closing current window
              <Button onClick={() => app.quit()}>
                {Messages.QUIT_DISCORD}
              </Button>
            )}
          </Flex>
        </Flex>
      </div>

      <Updater />

      <div style={{ marginTop: 10 }} />

      <Category
        title="Notifications"
        subtitle="Configure notifications here"
        icon={Icons.DiscordIcon.from("EnvelopeIcon")}
        onOpen={() => dummyNotification.open()}
        onClose={() => dummyNotification.close()}
      >
        <div className="vx-notification-position-wrapper">
          <div className="vx-notification-position">
            <NotificationSettings 
              onChange={(event, position) => {
                setNotificationPosition(position);
                internalDataStore.set("notification-position", position);
              }} 
              position={notificationPosition} 
            />
          </div>
        </div>
      </Category>

      {IS_DESKTOP && (
        <>
          <div style={{ marginTop: 10 }} />

          <Category
            title="Window Settings"
            subtitle="Settings for the browser window"
            icon={Icons.DiscordIcon.from("BrowserIcon")}
          >
            <FormSwitch
              // idk if this is everywhere 
              disabled={!window.DiscordNative!.window.supportsContentProtection?.()}
              value={contentProtection}
              onChange={(value) => {
                setContentProtection(value);
                internalDataStore.set("content-protection", value);
                window.DiscordNative!.window.setContentProtection!(value);
              }}
              style={{ marginTop: 20 }}
              note={Messages.CONTENT_PROTECTION_NOTE}
            >
              {Messages.CONTENT_PROTECTION}
            </FormSwitch>
            <FormSwitch
              value={nativeFrame.get()}
              onChange={(value) => {
                openConfirmModal(Messages.ARE_YOU_SURE, [
                  "Do you want to restart Discord to toggle native frame?"
                ], {
                  confirmText: "Restart",
                  onConfirm: () => {
                    nativeFrame.set(value);
                  }
                });
              }}
              style={{ marginTop: 20 }}
              note={Messages.NATIVE_FRAME_NOTE}
            >
              {Messages.NATIVE_FRAME}
            </FormSwitch>
            <FormSwitch
              hideBorder
              value={transparency.get()}
              onChange={(value) => {
                openConfirmModal(Messages.ARE_YOU_SURE, [
                  "Do you want to restart Discord to toggle transparency?"
                ], {
                  confirmText: "Restart",
                  onConfirm: () => {
                    transparency.set(value);
                  }
                });
              }}
              style={{ marginTop: 20 }}
              note={Messages.TRANSPARENCY_NOTE.format({ })}
            >
              {Messages.TRANSPARENCY}
            </FormSwitch>
          </Category>
        </>
      )}

      <div style={{ marginTop: 10 }} />

      <Category
        title="VX Settings"
        subtitle="Miscellaneous settings for VX"
        icon={Icons.Logo}
      >
        <FormSwitch
          value={userSettingShortcut}
          onChange={(value) => {
            setUserSettingShortcut(value);
            internalDataStore.set("user-setting-shortcut", value);
          }}
          style={{ marginTop: 20 }}
          note={Messages.USER_SETTINGS_SHORTCUT_NOTE}
        >
          {Messages.USER_SETTINGS_SHORTCUT}
        </FormSwitch>

        <FormSwitch
          value={preserveQuery}
          onChange={(value) => {
            setPreserveQuery(value);
            internalDataStore.set("preserve-query", value);
          }}
          style={{ marginTop: 20 }}
          note={Messages.PRESERVE_ADDON_QUERY_NOTE}
        >
          {Messages.PRESERVE_ADDON_QUERY}
        </FormSwitch>

        <FormSwitch
          value={showFavicon}
          onChange={(value) => {
            setShowFavicon(value);
            internalDataStore.set("show-favicon", value);
          }}
          style={{ marginTop: 20 }}
          note={Messages.SHOW_FAVICON_NOTE}
        >
          {Messages.SHOW_FAVICON}
        </FormSwitch>

        <FormSwitch
          disabled={nativeFrame.get() || window.VXNative?.app.platform !== "win32"}
          value={nativeFrame.get() ? false : addVXTitleBarButton}
          onChange={(value) => {
            setVXTitleBarButton(value);
            internalDataStore.set("vx-titlebar", value);
          }}
          style={{ marginTop: 20 }}
          note={Messages.ADD_VX_TO_TITLEBAR_NOTE}
          hideBorder
        >
          {Messages.ADD_VX_TO_TITLEBAR}
        </FormSwitch>
      </Category>
    </Page>
  )
};