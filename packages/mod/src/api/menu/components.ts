import { SystemDesign } from "../../components";
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

type MenuItemLabelAndRenderProps = { label: React.ReactNode } | { render(props: MenuItemRenderProps): React.ReactNode };

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
    return SystemDesign.Menu;
  },
  get MenuCheckboxItem(): React.FunctionComponent<MenuCheckboxItemProps> { 
    return SystemDesign.MenuCheckboxItem;
  },
  get MenuControlItem(): React.FunctionComponent<MenuControlItemProps> { 
    return SystemDesign.MenuControlItem;
  },
  get MenuGroup(): React.FunctionComponent<MenuGroupProps> { 
    return SystemDesign.MenuGroup;
  },
  get MenuItem(): React.FunctionComponent<MenuItemProps> { 
    return SystemDesign.MenuItem;
  },
  get MenuRadioItem(): React.FunctionComponent<MenuRadioItemProps> { 
    return SystemDesign.MenuRadioItem;
  },
  get MenuSearchControl(): React.FunctionComponent<MenuSearchControlProps> { 
    return SystemDesign.MenuSearchControl;
  },
  get MenuSeparator(): React.FunctionComponent { 
    return SystemDesign.MenuSeparator;
  },
  get MenuSliderControl(): React.FunctionComponent<MenuSliderControlProps> { 
    return SystemDesign.MenuSliderControl;
  },
  get MenuSpinner(): React.FunctionComponent { 
    return SystemDesign.MenuSpinner;
  }
};