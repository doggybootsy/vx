import { getProxyByKeys } from "@webpack";
import { SystemDesign } from "../../components";

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

let counter = 0;
export function openModal(Component: ModalComponent, options: ModalOptions = {}) {
  options.modalKey ??= `vx-${counter++}`;

  if (typeof Component !== "function") () => Component;

  SystemDesign.openModal((props: ModalProps) => (
    <Component {...props} />
  ), options);

  return {
    close: () => closeModal(options.modalKey!),
    id: options.modalKey
  };
};
export function closeModal(id: string) {  
  SystemDesign.closeModal(id);
};
export function closeAllModals() {
  SystemDesign.closeAllModals();
};
export function hasModalOpen(id: string) {
  return SystemDesign.hasModalOpen(id);
};