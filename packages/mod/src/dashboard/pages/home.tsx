import { IS_DESKTOP } from "self";
import { Panel } from "..";
import { internalDataStore } from "../../api/storage";
import { Button, Collapsable, Flex } from "../../components";
import { FormSwitch } from "../../components/switch";
import { app, extensions } from "../../native";
import { React, WindowUtil } from "../../webpack/common";

export function Home() {
  const [ contentProtection, setContentProtection ] = React.useState(() => internalDataStore.get("content-protection") ?? false);
  const [ userSettingShortcut, setUserSettingShortcut ] = React.useState(() => internalDataStore.get("user-setting-shortcut") ?? true);

  return (
    <Panel title="Home">
      <Flex justify={Flex.Justify.BETWEEN}>
        <Button onClick={() => app.restart()}>
          Restart Discord
        </Button>
        <Button onClick={() => location.reload()}>
          Reload Discord
        </Button>
        <Button onClick={() => app.quit()}>
          Quit Discord
        </Button>
      </Flex>
      
      {IS_DESKTOP && (
        <Collapsable className="vx-collapsable-section" header="Extensions">
          <div className="vx-ext-message">
            You can load any manifest v2 extensions (Electron itself doesn't support manifest v3) by adding any unzipped extension to the extensions directory, then restarting discord. 
          </div>
          <div className="vx-ext-message">
            To install React Developer Tools you need to go to the special RDT download page, by clicking the button below.{"\n"}
            This button takes you to a download page that downloads a special version of RDT thats downgraded to manifest v2.{"\n"}
            After you download this version of RDT you need to unzip it then place it in the extension directory
          </div>
          <Flex gap={6}>
            <Button
              onClick={() => {
                extensions.open();
              }}
            >Open Extensions Directory</Button>
            <Button
              onClick={(event) => {
                WindowUtil.handleClick({
                  href: "https://web.archive.org/web/20221207185248/https://polypane.app/fmkadmapgofadopljbjfkapdkoienihi.zip"
                }, event);
              }}
            >RDT Download</Button>
          </Flex>
        </Collapsable>
      )}
      
      {IS_DESKTOP && (
        <FormSwitch
          // idk if this is everywhere 
          disabled={!window.DiscordNative!.window.supportsContentProtection?.()}
          value={contentProtection}
          onChange={(value) => {
            setContentProtection(value);
            internalDataStore.set("content-protection", value);
            window.DiscordNative!.window.setContentProtection(value);
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
    </Panel>
  )
};