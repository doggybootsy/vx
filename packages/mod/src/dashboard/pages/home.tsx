import { Panel } from "..";
import { internalDataStore } from "../../api/storage";
import { Button, Collapsable, Flex, FlexChild, Markdown } from "../../components";
import { FormSwitch } from "../../components/switch";
import { app, extensions } from "../../native";
import { React, WindowUtil } from "../../webpack/common";

export function Home() {
  const [ minimap, setMinimap ] = React.useState(() => internalDataStore.get("custom-css-minimap") ?? true);
  const [ autosave, setAutosave ] = React.useState(() => internalDataStore.get("custom-css-autosave") ?? true);

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
      <Collapsable className="vx-collapsable-section" header="Custom CSS">
        <FormSwitch
          value={minimap}
          onChange={(value) => {
            setMinimap(value);
            internalDataStore.set("custom-css-minimap", value);
          }}
          note="Shows the minimap off to the right of the editor"
        >
          MiniMap
        </FormSwitch>
        <FormSwitch
          value={autosave}
          onChange={(value) => {            
            setAutosave(value);
            internalDataStore.set("custom-css-autosave", value);
          }}
          note="When disabled you need to manually do 'ctrl+s' or click the save icon to save"
          hideBorder
        >
          Autosave
        </FormSwitch>
      </Collapsable>
      <Collapsable className="vx-collapsable-section" header="Extensions">
        <div className="vx-ext-message">
          You can load any manifest v2 extensions by adding any unzipped extension to the extensions directory, then restarting discord. 
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
    </Panel>
  )
};