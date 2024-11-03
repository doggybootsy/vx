import { Button, transformContent } from "../../components";
import { getProxyByStrings } from "@webpack";
import { openModal } from "./actions";
import { Messages } from "vx:i18n";

interface AlertModalProps {
  body: React.ReactNode,
  title: React.ReactNode,
  className: string,
  confirmColor: string,
  confirmText: React.ReactNode,
  onConfirm(): void,
  secondaryConfirmText?: React.ReactNode,
  onConfirmSecondary(): void,
  cancelText?: React.ReactNode,
  onCancel(): void,
  transitionState: 0 | 1 | 2 | 3 | 4 | null,
  onClose(): void
};

const Alert = getProxyByStrings<React.FunctionComponent<AlertModalProps>>([ ".minorContainer", "secondaryConfirmText", ".Direction.VERTICAL" ])

interface AlertModalOptions {
  danger?: boolean,
  confirmText?: React.ReactNode,
  secondaryConfirmText?: React.ReactNode,
  cancelText?: React.ReactNode,
  onConfirm?(): void,
  onConfirmSecondary?(): void,
  onCancel?(): void,
  onCloseCallback?(): void,
  onCloseRequest?(closedFromButton: boolean): boolean
};

export function openAlertModal(title: React.ReactNode, body: React.ReactNode, options: AlertModalOptions = { }) {
  const {
    onCloseCallback = () => {},
    onCloseRequest = () => true
  } = options;
  let closedFromButton = false;

  const modal = openModal((props) => {
    const {
      danger = false,
      confirmText = Messages.OKAY,
      secondaryConfirmText,
      cancelText,
      onConfirm = () => {},
      onConfirmSecondary = () => {},
      onCancel = () => {}
    } = options;
    
    return (
      <Alert
        title={title}
        body={transformContent(body, "vx-modal-line")}
        className="vx-modals-alert-modal"
        confirmColor={danger ? Button.Colors.RED : Button.Colors.BRAND}
        confirmText={confirmText}
        secondaryConfirmText={secondaryConfirmText}
        cancelText={cancelText}
        onConfirm={() => {
          onConfirm();
          if (onCloseRequest(true))
            modal.close();
          closedFromButton = true;
        }}
        onConfirmSecondary={() => {
          onConfirmSecondary();
          if (onCloseRequest(true))
            modal.close();
          closedFromButton = true;
        }}
        onCancel={() => {
          onCancel();
          if (onCloseRequest(true))
            modal.close();
          closedFromButton = true;
        }}
        onClose={props.onClose}
        transitionState={props.transitionState}
      />
    )
  }, {
    onCloseCallback() {
      if (!closedFromButton) onCloseCallback();
    },
    onCloseRequest() {
      if (onCloseRequest(false)) modal.close();
    }
  });

  return modal;
};
