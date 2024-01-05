import { MegaModule } from "../../components";
import { IconProps } from "../../components/icons";

interface MenuProps {
  navId: string,
  onClose(): void,
  children: React.ReactNode,
  className?: string,
  context?: "APP",
  onHeightUpdate?: () => void,
  position?: "right" | "left",
  target?: Element,
  theme?: string
};

type MenuItemColor = "default" | "danger" | "premium-gradient";

interface MenuItemRenderProps {
  color: MenuItemColor,
  disabled: boolean,
  isFocused: boolean
};

type MenuItemLabelAndRenderProps = { label: string } | { render(props: MenuItemRenderProps): React.ReactNode };

interface BaseMenuItemProps extends Record<string, any> {
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
  control(props: MenuControlProps, ref: { ref: null | void | MenuControlRef }): React.ReactElement
};

interface MenuSliderControlProps extends MenuControlProps {
  value: number,
  maxValue?: number,
  minValue?: number
  onChange(value: number): void,
  renderValue?(value: number): React.ReactNode,
  ref: { ref: null | void | MenuControlRef }
};
interface MenuSearchControlProps extends MenuControlProps {
  query: string,
  onChange(value: string): void,
  loading?: boolean,
  placeholder?: string
  ref: { ref: null | void | MenuControlRef }
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
    return MegaModule.Menu;
  },
  get MenuCheckboxItem(): React.FunctionComponent<MenuCheckboxItemProps> { 
    return MegaModule.MenuCheckboxItem;
  },
  get MenuControlItem(): React.FunctionComponent<MenuControlItemProps> { 
    return MegaModule.MenuControlItem;
  },
  get MenuGroup(): React.FunctionComponent<MenuGroupProps> { 
    return MegaModule.MenuGroup;
  },
  get MenuItem(): React.FunctionComponent<MenuItemProps> { 
    return MegaModule.MenuItem;
  },
  get MenuRadioItem(): React.FunctionComponent<MenuRadioItemProps> { 
    return MegaModule.MenuRadioItem;
  },
  get MenuSearchControl(): React.FunctionComponent<MenuSearchControlProps> { 
    return MegaModule.MenuSearchControl;
  },
  get MenuSeparator(): React.FunctionComponent { 
    return MegaModule.MenuSeparator;
  },
  get MenuSliderControl(): React.FunctionComponent<MenuSliderControlProps> { 
    return MegaModule.MenuSliderControl;
  },
  get MenuSpinner(): React.FunctionComponent { 
    return MegaModule.MenuSpinner;
  }
};