import { useState } from "react";
import { closeMenu, MenuCallback, MenuComponents, MenuConfig, MenuRenderProps, openMenu, patch, unpatch } from "../api/menu";
import { BaseMenuItemProps, MenuCheckboxItemProps, MenuControlItemProps, MenuRadioItemProps } from "../api/menu/components";

interface MenuItemSeparator {
  type: "separator"
}
interface MenuItemSubmenu extends BaseMenuItemProps {
  type: "submenu",
  render?: MenuItem[],
  items?: MenuItem[],
  danger?: boolean,
  onClick?(event: React.MouseEvent): void,
}
interface MenuItemDefault extends BaseMenuItemProps {
  type?: "item",
  danger?: boolean,
  onClick?(event: React.MouseEvent): void,
}
interface MenuItemRadio extends MenuRadioItemProps {
  type: "radio",
  danger?: boolean,
  onClick?(event: React.MouseEvent): void,
  active?: boolean
}
interface MenuItemCheckbox extends MenuCheckboxItemProps {
  type: "toggle",
  danger?: boolean,
  onClick?(event: React.MouseEvent): void,
  active?: boolean
}
interface MenuItemControl extends MenuControlItemProps {
  type: "control"
}
interface MenuItemGroup {
  type: "group",
  items: MenuItem[]
}
type MenuItem = MenuItemSeparator | MenuItemSubmenu | MenuItemDefault | MenuItemRadio | MenuItemCheckbox | MenuItemControl;

export class ContextMenu {
  patch(menuId: string, callback: MenuCallback) {
    return patch("betterdiscord", menuId, callback);
  }
  unpatch(menuId: string, callback: MenuCallback) {
    unpatch("betterdiscord", menuId, callback);
  }
  
  buildItem(props: MenuItem) {
    if (props.type === "separator") return <MenuComponents.MenuSeparator />;

    let Component: React.ComponentType<any> = MenuComponents.MenuItem;
    if (props.type === "submenu") {
      if (!props.children) props.children = this.buildMenuChildren((props.render || props.items)!);
    }
    else if (props.type === "toggle" || props.type === "radio") {
      Component = props.type === "toggle" ? MenuComponents.MenuCheckboxItem : MenuComponents.MenuRadioItem;
      if (props.active) props.checked = props.active;
    }
    else if (props.type === "control") {
      Component = MenuComponents.MenuControlItem;
    }
    
    if (props.type !== "control") {
      if (!props.id) props.id = `${props.label.replace(/^[^a-z]+|[^\w-]+/gi, "-")}`;
      // @ts-expect-error
      if (props.danger) props.color = "danger";
      if (props.onClick && !props.action) props.action = props.onClick;
      // @ts-expect-error
      props.extended = true;
    }

    // This is done to make sure the UI actually displays the on/off correctly
    if (props.type === "toggle") {
      const [ active, doToggle ] = useState(props.checked || false);
      const originalAction = props.action;
      props.checked = active;
      props.action = function(event: React.MouseEvent) {
        doToggle(!active);
        originalAction?.(event);
      }
    }
    
    return <Component {...props} />;
  }
  buildMenuChildren(setup: (MenuItem | MenuItemGroup)[]) {
    function mapper(this: ContextMenu, item: MenuItem | MenuItemGroup) {
      if (item.type === "group") return buildGroup.call(this, item);
      return this.buildItem(item);
    };
    function buildGroup(this: ContextMenu, group: MenuItemGroup): React.ReactNode {
      const items = group.items.map(mapper.bind(this)).filter(i => i);
      return <MenuComponents.MenuGroup>{items}</MenuComponents.MenuGroup>;
    }
    
    return setup.map(mapper.bind(this)).filter(i => i);
  }
  buildMenu(setup: (MenuItem | MenuItemGroup)[]): React.ComponentType<MenuRenderProps & { onClose(): void }> {
    return (props) => <MenuComponents.Menu {...props} navId={(props as any).navId || "betterdiscord-menu"}>{this.buildMenuChildren(setup)}</MenuComponents.Menu>
  }

  open(event: MouseEvent | React.MouseEvent, MenuComponent: React.ComponentType<MenuRenderProps & { onClose(): void }>, config: MenuConfig) {
    return openMenu(event, (props) => (
      <MenuComponent {...props} onClose={closeMenu} />
    ), config);
  }
  close() {
    closeMenu();
  }
}