import { ModalComponents, openModal } from "../../../../api/modals";
import { ErrorBoundary, Flex, FlexChild } from "../../../../components";
import { CreatedSetting } from "../../../../plugins/settings";

export function openPluginSettingsModal(name: string, settings: Record<string, CreatedSetting<any>> | React.ComponentType) {
  let Content: React.ComponentType;
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
            {name}
          </div>
          <ModalComponents.ModalCloseButton onClick={props.onClose} />
        </ModalComponents.ModalHeader>
        <ModalComponents.ModalContent>
          <ErrorBoundary>
            <Content />
          </ErrorBoundary>
        </ModalComponents.ModalContent>
      </ModalComponents.ModalRoot>
    );
  });
};