import { IconProps } from "renderer/components/icons";
import VXError from "renderer/error";
import webpack from "renderer/webpack";
import { MenuRenderProps } from "renderer/menus";

interface MenuProps extends MenuRenderProps {
  navId: string,
  onClose(): void,
  children: React.ReactNode
}

type MenuItemColor = "default" | "danger" | "premium-gradient";

interface MenuItemRenderProps {
  color: MenuItemColor,
  disabled: boolean,
  isFocused: boolean
};

type MenuItemLabelAndRenderProps = { label: string } | { render(props: MenuItemRenderProps): React.ReactNode };
// Extends Dict because MenuItem has to many props
interface BaseMenuItemProps extends VX.Dict {
  id: string,
  disabled?: boolean,
  action?(event: React.MouseEvent): void,
  children?: React.ReactNode,
  icon?: React.FunctionComponent<IconProps>,
  color?: MenuItemColor,
  subtext?: string,
  focusedClassName?: string,
  className?: string,
  keepItemStyles?: boolean,
  dontCloseOnActionIfHoldingShiftKey?: boolean,
  imageUrl?(props: unknown): string
};

type MenuItemProps = BaseMenuItemProps & MenuItemLabelAndRenderProps

interface MenuCheckboxItemProps {
  id: string,
  label: string,
  disabled?: boolean,
  subtext?: React.ReactNode,
  action?(event: React.MouseEvent): void,
  checked: boolean
};

interface MenuControlProps {
  disabled?: boolean,
  isFocused: boolean,
  onClose(): void
};
interface MenuControlRef {
  activate(): void,
  blur(): void,
  focus(): void
};

interface MenuControlItemProps {
  id: string,
  label?: string,
  disabled?: boolean,
  control(props: MenuControlProps, ref: VX.NullableRef<MenuControlRef>): React.ReactElement
};

interface MenuSliderControlProps extends MenuControlProps {
  value: number,
  maxValue?: number,
  minValue?: number
  onChange(value: number): void,
  renderValue?(value: number): React.ReactNode,
  ref: VX.NullableRef<MenuControlRef>
};
interface MenuSearchControlProps extends MenuControlProps {
  query: string,
  onChange(value: string): void,
  loading?: boolean,
  placeholder?: string
  ref: VX.NullableRef<MenuControlRef>
}

interface MenuGroupProps {
  label?: string,
  children?: React.ReactNode
};
interface MenuRadioItemProps extends MenuCheckboxItemProps {
  group: string
};


export default {
  get Menu(): React.FunctionComponent<MenuProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.Menu;
  },
  get MenuCheckboxItem(): React.FunctionComponent<MenuCheckboxItemProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuCheckboxItem;
  },
  get MenuControlItem(): React.FunctionComponent<MenuControlItemProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuControlItem;
  },
  get MenuGroup(): React.FunctionComponent<MenuGroupProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuGroup;
  },
  get MenuItem(): React.FunctionComponent<MenuItemProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuItem;
  },
  get MenuRadioItem(): React.FunctionComponent<MenuRadioItemProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuRadioItem;
  },
  get MenuSearchControl(): React.FunctionComponent<MenuSearchControlProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuSearchControl;
  },
  get MenuSeparator(): React.FunctionComponent { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuSeparator;
  },
  get MenuSliderControl(): React.FunctionComponent<MenuSliderControlProps> { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuSliderControl;
  },
  get MenuSpinner(): React.FunctionComponent { 
    const components = webpack.common.components;
    if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);
    return components.MenuSpinner;
  }
};