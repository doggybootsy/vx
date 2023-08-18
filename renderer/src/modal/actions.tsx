import webpack from "renderer/webpack";

export type ModalComponent = (props: {
  transitionState?: 0 | 1 | 2 | 3 | 4,
  onClose: () => void
}) => React.ReactNode;
export type ModalOptions = {
  modalKey?: string,
  instant?: boolean,
  onCloseRequest?: Function,
  onCloseCallback?: Function
};

const queue = new Map<string, { component: ModalComponent, options: ModalOptions }>();;

let counter = 0;
export function openModal(component: ModalComponent, options: ModalOptions = {}) {  
  options.modalKey ??= `vx-${counter++}`;

  if (!webpack.isReady) queue.set(options.modalKey!, { component, options });
  else {
    const components = webpack.common.components!;
    const React = webpack.common.React!;

    components.openModal((props) => React.createElement(component, props), options);
  }

  return {
    close: () => closeModal(options.modalKey!),
    id: options.modalKey
  };
};
export function closeModal(id: string) {
  queue.delete(id);
  
  if (webpack.isReady) webpack.common.components!.closeModal(id);
};
export function closeAll() {
  const components = webpack.common.components;
  if (!components) return;

  components.closeAllModals();
};
export function hasModalOpen(id: string) {
  const components = webpack.common.components;
  if (!components) return false;

  return components.hasModalOpen(id);
};

webpack.whenReady(() => {
  for (const [, { component, options }] of queue) {
    openModal(component, options);
  }
});