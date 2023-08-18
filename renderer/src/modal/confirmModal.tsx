import VXError from "renderer/error";
import { Button, ErrorBoundary } from "renderer/components";
import MarkDownParser from "renderer/ui/markdown";
import webpack from "renderer/webpack";
import { openModal } from "renderer/modal/actions";

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
  const React = webpack.common.React;
  if (!React) throw new VXError(VXError.codes.NO_REACT);
  const components = webpack.common.components;
  if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
  const i18n = webpack.common.i18n;
  if (!i18n) throw new VXError(VXError.codes.NO_I18N);

  if (!Array.isArray(content)) content = [ content ];
  const newContent: React.ReactNode[] = [ ];
  for (const item of content) {
    newContent.push(
      <div className="vx-modals-content-line">
        {typeof item === "string" ? (
          <MarkDownParser text={item} />
        ) : (
          <ErrorBoundary>
            {item}
          </ErrorBoundary>
        )}
      </div>
    );
  };

  function dummy() { };
  const {
    confirmText = i18n.Messages.OKAY,
    onConfirm = dummy,
    cancelText = i18n.Messages.CANCEL,
    onCancel = dummy,
    onCloseCallback = dummy,
    onCloseRequest = () => true,
    danger = false
  } = options;
  
  let closedFromButton = false;

  const modal = openModal((props) => (
    <components.ConfirmModal
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
      {newContent}
    </components.ConfirmModal>
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
