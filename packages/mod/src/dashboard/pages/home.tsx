import { Panel } from "..";
import { internalDataStore } from "../../api/storage";
import { Button, Collapsable, Flex, FlexChild, Markdown } from "../../components";
import { FormSwitch } from "../../components/switch";
import { app, extensions } from "../../native";
import { React, WindowUtil } from "../../webpack/common";

export function Home() {
  const [ contentProtection, setContentProtection ] = React.useState(() => internalDataStore.get("content-protection") ?? false);

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
            onClick={() => {
              WindowUtil.open({
                href: "https://web.archive.org/web/20221207185248/https://polypane.app/fmkadmapgofadopljbjfkapdkoienihi.zip"
              });
            }}
          >RDT Download</Button>
        </Flex>
      </Collapsable>

      <FormSwitch
        disabled={typeof window.DiscordNative === "object" ? !window.DiscordNative.window.supportsContentProtection() : true}
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
    </Panel>
  )
};