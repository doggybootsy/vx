import { ModalComponents, openModal } from "../../../../api/modals";
import { Flex, FlexChild } from "../../../../components";
import { Plugin } from "../../../../plugins";

export function openPluginSettingsModal(plugin: Plugin) {
  const settings = plugin.exports.settings!;

  let Content: React.FunctionComponent;
  if (typeof settings === "function") Content = settings;
  else {
    const entries = Object.entries(settings);

    Content = () => (
      <Flex direction={Flex.Direction.VERTICAL} gap={20}>
        {entries.map(([ key, setting ]) => (
          <FlexChild key={`vx-p-s-${key}`}>
            <setting.render />
          </FlexChild>
        ))}
      </Flex>
    );
  };

  openModal((props) => {
    return (
      <ModalComponents.ModalRoot
        transitionState={props.transitionState}
        size={ModalComponents.ModalSize.MEDIUM}
      >
        <ModalComponents.ModalHeader separator={false} justify={Flex.Justify.BETWEEN}>
          <div className="vx-modal-title">
            {plugin.name}
          </div>
          <ModalComponents.ModalCloseButton onClick={props.onClose} />
        </ModalComponents.ModalHeader>
        <ModalComponents.ModalContent>
          <Content />
        </ModalComponents.ModalContent>
      </ModalComponents.ModalRoot>
    );
  });
};