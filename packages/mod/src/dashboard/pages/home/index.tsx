import { useState } from "react";
import { IS_DESKTOP } from "self";
import { Panel } from "../..";
import { internalDataStore } from "../../../api/storage";
import { Button, Flex, Icons } from "../../../components";
import { FormSwitch } from "../../../components/switch";
import { app } from "../../../native";
import { Updater } from "./updater";

export function Home() {
  const [ contentProtection, setContentProtection ] = useState(() => internalDataStore.get("content-protection") ?? false);
  const [ userSettingShortcut, setUserSettingShortcut ] = useState(() => internalDataStore.get("user-setting-shortcut") ?? true);
  const [ preserveQuery, setPreserveQuery ] = useState(() => internalDataStore.get("preserve-query") ?? true);
  const [ showFavicon, setShowFavicon ] = useState(() => internalDataStore.get("show-favicon") ?? true);

  return (
    <Panel title="Home">
      <div className="vx-home-header">
        <div className="vx-home-logo">
          <img src="https://media0.giphy.com/media/3og0IFrHkIglEOg8Ba/giphy.gif" />
          <Icons.Logo size={60} />
        </div>
        <Flex className="vx-home-body" justify={Flex.Justify.BETWEEN} direction={Flex.Direction.VERTICAL}>
          <div className="vx-home-welcome">
            Welcome To VX
          </div>
          <Flex justify={Flex.Justify.START} gap={6} grow={0}>
            <Button onClick={() => location.reload()}>
              Reload Discord
            </Button>
            {IS_DESKTOP && (
              <Button onClick={() => app.restart()}>
                Restart Discord
              </Button>
            )}
            {IS_DESKTOP && (
              // Web api prevents you from closing current window
              <Button onClick={() => app.quit()}>
                Quit Discord
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
          note="When enabled you cannot take screenshots or screen recordings of Discord"
        >
          Content Protection
        </FormSwitch>
      )}

      <FormSwitch
        value={userSettingShortcut}
        onChange={(value) => {
          setUserSettingShortcut(value);
          internalDataStore.set("user-setting-shortcut", value);
        }}
        style={{ marginTop: 20 }}
        note="When shift clicking the user settings panel, it'll opens vx dashboard instead of settings"
      >
        User Settings Shortcut
      </FormSwitch>

      <FormSwitch
        value={preserveQuery}
        onChange={(value) => {
          setPreserveQuery(value);
          internalDataStore.set("preserve-query", value);
        }}
        style={{ marginTop: 20 }}
        note="When you exit settings with a query it will save it, for when you open it again"
      >
        Preserve Addon Query
      </FormSwitch>

      <FormSwitch
        value={showFavicon}
        onChange={(value) => {
          setShowFavicon(value);
          internalDataStore.set("show-favicon", value);
        }}
        style={{ marginTop: 20 }}
        note="Shows the websites favicon instead of globe on addon cards"
      >
        Show Favicon
      </FormSwitch>
    </Panel>
  )
};