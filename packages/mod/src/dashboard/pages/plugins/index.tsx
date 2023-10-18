import { Panel } from "../..";
import { Flex, Icons, FlexChild } from "../../../components";
import { plugins } from "../../../plugins";
import { PluginCard } from "./card";

export function Plugins() {
  const pluginKeys = Object.keys(plugins);

  return (
    <Panel title="Plugins">
      <div className="vx-addons-warning">
        <Icons.Warn 
          width={20} 
          height={20} 
          className="vx-addons-icon" 
        />
        <span>
          You need to reload to enable plugins!
        </span>
      </div>
      <Flex className="vx-addons" direction={Flex.Direction.VERTICAL} gap={8}>
        {pluginKeys.map((key) => (
          <FlexChild key={`vx-p-${key}`} >
            <PluginCard plugin={plugins[key]} />
          </FlexChild>
        ))}
      </Flex>
    </Panel>
  )
}