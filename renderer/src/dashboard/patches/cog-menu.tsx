import { components, patch } from "renderer/menus";
import { findInReactTree } from "renderer/util";
import useMenu from "renderer/dashboard/ui/menu";
import webpack from "renderer/webpack";
import Store from "renderer/store";
import { useStateFromStores } from "renderer/hooks";

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
  getShiftState() { return this.#isShiftHeldDown; };

  use(reactive = false) {
    const React = webpack.common.React!;

    if (reactive) return useStateFromStores([ this ], () => this.getShiftState());
    return React.useMemo(() => shiftStore.getShiftState(), [ ]);
  };
}

patch("VX/Dashboard", "user-settings-cog", (props, res) => {
  const React = webpack.common.React!;
  const isShiftHeldDown = shiftStore.use(false);

  const children = findInReactTree<React.ReactNode[]>(res, (item) => Array.isArray(item) && item.length > 5);
  if (!children) return;

  const menu = useMenu();

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