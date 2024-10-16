import { ModalComponents, openModal } from "../../../../api/modals";
import { ErrorBoundary, Flex, FlexChild } from "../../../../components";

export function openPluginSettingsModal(name: string, Content: React.ComponentType) {
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
          <div style={{ margin: 12 }} />
        </ModalComponents.ModalContent>
      </ModalComponents.ModalRoot>
    );
  });
};