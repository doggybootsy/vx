import { Messages } from "vx:i18n";
import { Button, SystemDesign, transformContent } from "../../components";
import { openModal } from "./actions";

export type ConfirmModalOptions = {
  confirmText?: string,
  onConfirm?(): void,
  cancelText?: string,
  onCancel?(): void,
  onCloseCallback?(): void,
  onCloseRequest?(closedFromButton: boolean): boolean,
  danger?: boolean
};

export function openConfirmModal(title: React.ReactNode, content: React.ReactNode | React.ReactNode[], options: ConfirmModalOptions = {}) {
  function dummy() { };
  const {
    confirmText = Messages.OKAY,
    onConfirm = dummy,
    cancelText = Messages.CANCEL,
    onCancel = dummy,
    onCloseCallback = dummy,
    onCloseRequest = () => true,
    danger = false
  } = options;

  let closedFromButton = false;
  
  const modal = openModal((props) => (
    <SystemDesign.ConfirmModal
      header={title}
      className="vx-modals-confirm-modal"
      confirmText={confirmText}
      onConfirm={() => {
        onConfirm();
        if (onCloseRequest(true))
          modal.close();
        closedFromButton = true;
      }}
      cancelText={cancelText}
      onCancel={() => {
        onCancel();
        if (onCloseRequest(true))
          modal.close();
        closedFromButton = true;
      }}
      confirmButtonColor={danger ? Button.Colors.RED : Button.Colors.BRAND}
      transitionState={props.transitionState}
      onClose={() => {}}
    >
      {transformContent(content, "vx-modal-line")}
    </SystemDesign.ConfirmModal>
  ), {
    onCloseCallback() {
      if (!closedFromButton) onCloseCallback();
    },
    onCloseRequest() {
      if (onCloseRequest(false))
        modal.close();
    }
  });

  return modal;
};