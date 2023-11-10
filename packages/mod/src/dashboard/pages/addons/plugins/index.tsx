import { Panel } from "../../..";
import { Flex, Icons, FlexChild, Tooltip, Button } from "../../../../components";
import { plugins } from "../../../../plugins";
import { PluginCard } from "./card";
import { React } from "../../../../webpack/common";

export function Plugins() {
  const entries = React.useMemo(() => Object.entries(plugins), [ ]);

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
        {entries.map(([ key, plugin ]) => (
          <FlexChild key={`vx-p-${key}`} >
            <PluginCard plugin={plugin} />
          </FlexChild>
        ))}
      </Flex>
    </Panel>
  )
}