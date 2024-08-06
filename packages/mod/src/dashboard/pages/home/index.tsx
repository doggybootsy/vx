import { useState } from "react";
import { IS_DESKTOP } from "vx:self";
import { Panel } from "../..";
import { internalDataStore } from "../../../api/storage";
import { Button, Flex, Icons } from "../../../components";
import { FormSwitch } from "../../../components/switch";
import { app, transparency } from "../../../native";
import { Updater } from "./updater";
import { Messages } from "vx:i18n";
import { openConfirmModal } from "../../../api/modals";

export function Home() {
  const [ contentProtection, setContentProtection ] = useState(() => internalDataStore.get("content-protection") ?? false);
  const [ userSettingShortcut, setUserSettingShortcut ] = useState(() => internalDataStore.get("user-setting-shortcut") ?? true);
  const [ preserveQuery, setPreserveQuery ] = useState(() => internalDataStore.get("preserve-query") ?? true);
  const [ showFavicon, setShowFavicon ] = useState(() => internalDataStore.get("show-favicon") ?? true);
  const [ addVXTitleBarButton, setVXTitleBarButton ] = useState(() => internalDataStore.get("vx-titlebar") ?? false);

  return (
    <Panel title="Home">
      <div className="vx-home-header">
        <div className="vx-home-logo">
          <img src="https://media0.giphy.com/media/3og0IFrHkIglEOg8Ba/giphy.gif" />
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

      {IS_DESKTOP && (
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
      )}
      {IS_DESKTOP && (
        <FormSwitch
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
      )}

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
        disabled={window.VXNative?.app.platform !== "win32"}
        value={addVXTitleBarButton}
        onChange={(value) => {
          setVXTitleBarButton(value);
          internalDataStore.set("vx-titlebar", value);
        }}
        style={{ marginTop: 20 }}
        note={Messages.ADD_VX_TO_TITLEBAR_NOTE}
      >
        {Messages.ADD_VX_TO_TITLEBAR}
      </FormSwitch>
    </Panel>
  )
};