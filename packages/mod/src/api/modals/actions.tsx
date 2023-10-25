import { getProxyByKeys } from "../../webpack";

export interface ModalProps {
  transitionState: 0 | 1 | 2 | 3 | 4 | null,
  onClose: () => void
};

export type ModalComponent = (props: ModalProps) => React.ReactNode;

export type ModalOptions = {
  modalKey?: string,
  instant?: boolean,
  onCloseRequest?: Function,
  onCloseCallback?: Function
};

const ModalActions = getProxyByKeys<{
  openModal(component: ModalComponent, options: ModalOptions): string,
  closeModal(id: string): void,
  closeAllModals(): void,
  hasModalOpen(id: string): boolean
}>([ "openModal", "closeModal" ]);

let counter = 0;
export function openModal(Component: ModalComponent, options: ModalOptions = {}) {
  options.modalKey ??= `vx-${counter++}`;

  if (typeof Component !== "function") () => Component;

  ModalActions.openModal((props) => (
    <Component {...props} />
  ), options);

  return {
    close: () => closeModal(options.modalKey!),
    id: options.modalKey
  };
};
export function closeModal(id: string) {  
  ModalActions.closeModal(id);
};
export function closeAllModals() {
  ModalActions.closeAllModals();
};
export function hasModalOpen(id: string) {
  return ModalActions.hasModalOpen(id);
};