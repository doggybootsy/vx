import { Panel } from "../..";
import { Flex, Icons, FlexChild, Tooltip, Button } from "../../../components";
import { plugins } from "../../../plugins";
import { PluginCard } from "./card";

export function Plugins() {
  const pluginKeys = Object.keys(plugins);

  return (
    <Panel 
      title="Plugins"
      buttons={
        <>
          <Tooltip text="Reload Discord">
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();
                  location.reload();
                }}
              >
                <Icons.Reload />
              </Button>
            )}
          </Tooltip>
        </>
      }
    >
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