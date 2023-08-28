import { components, patch } from "renderer/menus";
import { findInReactTree } from "renderer/util";
import Menu from "renderer/dashboard/ui/menu";
import webpack from "renderer/webpack";
import Store from "renderer/store";

const shiftStore = new class ShiftStore extends Store {
  constructor() {
    super();

    document.addEventListener("keydown", (event) => {
      if (this.#isShiftHeldDown && event.shiftKey) return;

      this.#isShiftHeldDown = event.shiftKey;
      this.emit();
    });
    document.addEventListener("keyup", (event) => {
      if (this.#isShiftHeldDown && event.shiftKey) return;
      
      this.#isShiftHeldDown = event.shiftKey;
      this.emit();
    });
  };

  #isShiftHeldDown = false;
  get isShiftHeldDown() { return this.#isShiftHeldDown; };
}

patch("VX/Dashboard", "user-settings-cog", (props, res) => {
  const React = webpack.common.React!;
  const isShiftHeldDown = React.useMemo(() => shiftStore.isShiftHeldDown, [ ]);

  const children = findInReactTree<React.ReactNode[]>(res, (item) => Array.isArray(item) && item.length > 5);
  if (!children) return;


  const menu = Menu();

  children.push(
    !isShiftHeldDown && (
      <components.MenuItem
        id="/vx"
        label="VX"
      >
        {menu}
      </components.MenuItem>
    )
  );
});