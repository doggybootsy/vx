import { Button, MegaModule, transformContent } from "../../components";
import { getProxyByKeys } from "@webpack";
import { I18n } from "@webpack/common";
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
    confirmText = I18n.Messages.OKAY,
    onConfirm = dummy,
    cancelText = I18n.Messages.CANCEL,
    onCancel = dummy,
    onCloseCallback = dummy,
    onCloseRequest = () => true,
    danger = false
  } = options;

  let closedFromButton = false;
  
  const modal = openModal((props) => (
    <MegaModule.ConfirmModal
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
    </MegaModule.ConfirmModal>
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