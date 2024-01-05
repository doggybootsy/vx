import { MegaModule } from "../../components";

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
    return MegaModule.ModalCloseButton;
  },
  get ModalContent(): React.FunctionComponent<ModalContentProps> { 
    return MegaModule.ModalContent;
  },
  get ModalFooter(): React.FunctionComponent<ModalFooterProps> { 
    return MegaModule.ModalFooter;
  },
  get ModalHeader(): React.FunctionComponent<ModalHeaderProps> { 
    return MegaModule.ModalHeader;
  },
  get ModalListContent(): React.FunctionComponent<any> { 
    return MegaModule.ModalListContent;
  },
  get ModalRoot(): React.FunctionComponent<ModalRootProps> { 
    return MegaModule.ModalRoot;
  },
  get ModalSize(): Record<"SMALL" | "MEDIUM" | "LARGE" | "DYNAMIC", string> { 
    return MegaModule.ModalSize;
  },
  get ModalTransitionState(): Record<"ENTERING" | "ENTERED" | "EXITING" | "EXITED" | "HIDDEN", 0 | 1 | 2 | 3 | 4> { 
    return MegaModule.ModalTransitionState;
  }
};