import { Panel } from "..";
import { internalDataStore } from "../../api/storage";
import { Button, Collapsable, Flex, FlexChild } from "../../components";
import { FormSwitch } from "../../components/switch";
import { app } from "../../native";
import { React } from "../../webpack/common";

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
    </Panel>
  )
};