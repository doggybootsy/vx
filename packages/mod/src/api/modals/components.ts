import { getProxyByKeys } from "../../webpack";

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

const components = getProxyByKeys<any>([ "ModalCloseButton", "ModalContent" ]);

export default {
  get ModalCloseButton(): React.FunctionComponent<ModalCloseButtonProps> { 
    return components.ModalCloseButton;
  },
  get ModalContent(): React.FunctionComponent<ModalContentProps> { 
    return components.ModalContent;
  },
  get ModalFooter(): React.FunctionComponent<ModalFooterProps> { 
    return components.ModalFooter;
  },
  get ModalHeader(): React.FunctionComponent<ModalHeaderProps> { 
    return components.ModalHeader;
  },
  get ModalListContent(): React.FunctionComponent<any> { 
    return components.ModalListContent;
  },
  get ModalRoot(): React.FunctionComponent<ModalRootProps> { 
    return components.ModalRoot;
  },
  get ModalSize(): Record<"SMALL" | "MEDIUM" | "LARGE" | "DYNAMIC", string> { 
    return components.ModalSize;
  },
  get ModalTransitionState(): Record<"ENTERING" | "ENTERED" | "EXITING" | "EXITED" | "HIDDEN", 0 | 1 | 2 | 3 | 4> { 
    return components.ModalTransitionState;
  }
};