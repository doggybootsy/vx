import { ModalComponents, openModal } from "../../../../api/modals";
import { Flex, FlexChild } from "../../../../components";
import { Plugin } from "../../../../plugins";

export function openPluginSettingsModal(plugin: Plugin) {
  const settings = plugin.exports.settings!;

  const entries = Object.entries(settings);

  openModal((props) => {
    return (
      <ModalComponents.ModalRoot
        transitionState={props.transitionState}
        size={ModalComponents.ModalSize.MEDIUM}
      >
        <ModalComponents.ModalHeader separator={false} justify={Flex.Justify.BETWEEN}>
          <div className="vx-settings-modal-title">
            {plugin.name}
          </div>
          <ModalComponents.ModalCloseButton onClick={props.onClose} />
        </ModalComponents.ModalHeader>
        <ModalComponents.ModalContent>
          <Flex direction={Flex.Direction.VERTICAL} gap={20}>
            {entries.map(([ key, setting ]) => (
              <FlexChild key={`vx-p-s-${key}`}>
                <setting.render />
              </FlexChild>
            ))}
          </Flex>
        </ModalComponents.ModalContent>
      </ModalComponents.ModalRoot>
    );
  });
};