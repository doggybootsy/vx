import VXError from "renderer/error";
import webpack from "renderer/webpack";

export default {
  get Menu() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.Menu;
  },
  get MenuCheckboxItem() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuCheckboxItem;
  },
  get MenuControlItem() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuControlItem;
  },
  get MenuGroup() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuGroup;
  },
  get MenuItem() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuItem;
  },
  get MenuRadioItem() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuRadioItem;
  },
  get MenuSearchControl() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuSearchControl;
  },
  get MenuSeparator() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuSeparator;
  },
  get MenuSliderControl() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuSliderControl;
  },
  get MenuSpinner() { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuSpinner;
  }
};