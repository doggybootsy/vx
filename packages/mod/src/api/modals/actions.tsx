import { getProxyByKeys, webpackReady } from "../../webpack";

export type ModalComponent = (props: {
  transitionState: 0 | 1 | 2 | 3 | 4 | null,
  onClose: () => void
}) => React.ReactNode;

export type ModalOptions = {
  modalKey?: string,
  instant?: boolean,
  onCloseRequest?: Function,
  onCloseCallback?: Function
};

const queue = new Map<string, { component: ModalComponent, options: ModalOptions }>();

const ModalActions = getProxyByKeys<{
  openModal(component: ModalComponent, options: ModalOptions): string,
  closeModal(id: string): void,
  closeAllModals(): void,
  hasModalOpen(id: string): boolean
}>([ "openModal", "closeModal" ]);

let counter = 0;
export function openModal(Component: ModalComponent, options: ModalOptions = {}) {
  options.modalKey ??= `vx-${counter++}`;

  if (!webpackReady) {
    queue.set(options.modalKey!, { options, component: Component });
  }
  else {
    ModalActions.openModal((props) => (
      <Component {...props} />
    ), options);
  };

  return {
    close: () => closeModal(options.modalKey!),
    id: options.modalKey
  };
};
export function closeModal(id: string) {
  queue.delete(id);
  
  if (webpackReady) ModalActions.closeModal(id);
};
export function closeAllModals() {
  if (webpackReady) ModalActions.closeAllModals();
};
export function hasModalOpen(id: string) {
  if (webpackReady) ModalActions.hasModalOpen(id);
};