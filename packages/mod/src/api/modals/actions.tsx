import { SystemDesign } from "../../components";

export type TransitionState = 0 | 1 | 2 | 3 | 4 | null;

export interface ModalProps {
  transitionState: TransitionState,
  onClose: () => void
}

export type ModalComponent = (props: ModalProps) => React.ReactNode;

type OnCloseRequest = () => void;
type OnCloseCallback = () => void;

type BackdropStyles = "BLUR" | "DARK" | "SUBTLE";

type Layer = React.ComponentType<{
  children: React.ReactNode
}>;

export interface ModalOptions {
  modalKey?: string,
  instant?: boolean,
  onCloseRequest?: OnCloseRequest,
  onCloseCallback?: OnCloseCallback,
  backdropStyle?: BackdropStyles,
  Layer?: Layer
}

let counter = 0;
export function openModal(render: ModalComponent, options: ModalOptions = {}) {
  options.modalKey ??= `vx-${counter++}`;

  if (typeof render !== "function") () => render;

  SystemDesign.openModal((props: ModalProps) => __jsx__(render, props), options);

  return {
    close: () => closeModal(options.modalKey!),
    id: options.modalKey,
    update(render: ModalComponent, updatedOptions?: ModalUpdateOptions) {
      updateModal(options.modalKey!, render, options = Object.assign({}, options, updatedOptions));
    },
    isOpen: () => hasModalOpen(options.modalKey!)
  };
}
export function closeModal(modalId: string) {
  SystemDesign.closeModal(modalId);
}
export function closeAllModals() {
  SystemDesign.closeAllModals();
}

export function hasModalOpen(modalId: string): boolean {
  return SystemDesign.hasModalOpen(modalId);
}
export function hasAnyModalOpen(): boolean {
  return SystemDesign.hasAnyModalOpen();
}

export function useModalContext(): "default" | "popout" {
  return SystemDesign.useModalContext();
}

export interface ModalUpdateOptions {
  onCloseRequest?: OnCloseRequest,
  onCloseCallback?: OnCloseCallback
}

export function updateModal(modalId: string, render: ModalComponent, options?: ModalUpdateOptions) {
  const { onCloseRequest, onCloseCallback } = Object.assign({}, options);

  SystemDesign.updateModal(modalId, (props: ModalProps) => __jsx__(render, props), onCloseRequest, onCloseCallback);
}

// export class Modal {
//   constructor(render: ModalComponent, options: ModalOptions = {}) {
//     this.#render = render;
//     this.#options = options;
//   }

//   #id: string | null = null;
//   #render: ModalComponent;
//   #options: ModalOptions;

//   show() {
//     if (typeof this.#id === "string") {
//       closeModal(this.#id);
//     }

//     this.#id = openModal(this.#render, this.#options).id;
    
//     return this;
//   }
//   close() {
//     if (typeof this.#id === "string") {
//       closeModal(this.#id);
//     }
//     this.#id = null;

//     return this;
//   }
  
//   update(render: ModalComponent, options?: ModalUpdateOptions) {
//     this.#render = render;
//     this.#options = Object.assign({}, this.#options, options);

//     if (typeof this.#id === "string") {
//       updateModal(this.#id, this.#render, this.#options);
//     }
//   }
  
//   isOpen() {
//     return typeof this.#id === "string" && hasModalOpen(this.#id);
//   }

//   getModalKey() {
//     return this.#id;
//   }
// }