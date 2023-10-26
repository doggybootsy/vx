import { Panel } from "../../..";
import { Button, Flex, FlexChild, Icons, Tooltip } from "../../../../components";
import { useInternalStore } from "../../../../hooks";
import { NoAddons } from "../shared";
import { ThemeCard } from "./card";
import { themeStore } from "./store";

export function Themes() {
  const keys = useInternalStore(themeStore, () => themeStore.keys());

  return (
    <Panel
      title="Themes"
      buttons={
        <>
          <Tooltip text="Upload">
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();

                  themeStore.upload();
                }}
              >
                <Icons.Upload />
              </Button>
            )}
          </Tooltip>
          <Tooltip text="New">
            {(props) => (
              <Button
                {...props}
                size={Button.Sizes.NONE}
                look={Button.Looks.BLANK} 
                className="vx-header-button"
                onClick={() => {
                  props.onClick();

                  themeStore.new();
                }}
              >
                <Icons.Plus />
              </Button>
            )}
          </Tooltip>
        </>
      }
    >
      <Flex className="vx-addons" direction={Flex.Direction.VERTICAL} gap={8}>
        {keys.length ? keys.map((key) => (
          <FlexChild key={`vx-c-${key}`} >
            <ThemeCard id={key} />
          </FlexChild>
        )) : (
          <NoAddons message="No Custom CSS Found" />
        )}
      </Flex>
    </Panel>
  );
};