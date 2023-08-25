import VXError from "renderer/error";
import webpack from "renderer/webpack";

interface ModalCloseButtonProps {
  className?: string,
  withCircleBackground?: boolean,
  onClick?(event: React.MouseEvent<HTMLButtonElement>): void
};
interface ModalContentProps {
  className?: string,
  children?: React.ReactNode,
  scrollerRef?(): unknown
};
interface ModalFooterProps {
  className?: string,
  children?: React.ReactNode,
  direction?: string,
  justify?: string,
  align?: string,
  wrap?: string
};
interface ModalHeaderProps {
  separator?: boolean,
  className?: string,
  children?: React.ReactNode,
  direction?: string,
  justify?: string,
  align?: string,
  wrap?: string
};
interface ModalRootProps {
  className?: string,
  children?: React.ReactNode,
  onAnimationEnd?(): void,
  hideShadow?: boolean,
  fullscreenOnMobile?: boolean,
  role?: string,
  size?: string,
  transitionState?: 0 | 1 | 2 | 3 | 4 | null
};

export default {
  get ModalCloseButton(): React.FunctionComponent<ModalCloseButtonProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalCloseButton;
  },
  get ModalContent(): React.FunctionComponent<ModalContentProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalContent;
  },
  get ModalFooter(): React.FunctionComponent<ModalFooterProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalFooter;
  },
  get ModalHeader(): React.FunctionComponent<ModalHeaderProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalHeader;
  },
  get ModalListContent(): React.FunctionComponent<any> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalListContent;
  },
  get ModalRoot(): React.FunctionComponent<ModalRootProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalRoot;
  },
  get ModalSize(): VX.ConstEnum<"SMALL" | "MEDIUM" | "LARGE" | "DYNAMIC"> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalSize;
  },
  get ModalTransitionState(): VX.Enum<"ENTERING" | "ENTERED" | "EXITING" | "EXITED" | "HIDDEN", 0 | 1 | 2 | 3 | 4> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalTransitionState;
  }
};