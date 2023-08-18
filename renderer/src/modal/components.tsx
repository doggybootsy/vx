import VXError from "renderer/error";
import webpack from "renderer/webpack";

export default {
  get ModalCloseButton() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalCloseButton;
  },
  get ModalContent() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalContent;
  },
  get ModalFooter() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalFooter;
  },
  get ModalHeader() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalHeader;
  },
  get ModalListContent() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalListContent;
  },
  get ModalRoot() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalRoot;
  },
  get ModalSize() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalSize;
  },
  get ModalTransitionState() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.ModalTransitionState;
  }
};