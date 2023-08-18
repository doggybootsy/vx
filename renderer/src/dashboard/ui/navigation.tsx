import CustomCSS from "renderer/ui/customCSS";
import { Icons } from "renderer/components";
import { cache } from "renderer/util";
import webpack, { filters } from "renderer/webpack";
import { openWindow } from "renderer/window";
import { openConfirmModal } from "renderer/modal";

const NavigatorButton = cache(() => {
  const filter = filters.byStrings("linkButtonIcon", ".linkButton,");

  return webpack.getModule<React.FunctionComponent<any>>((m) => m.prototype && filter(m.prototype.render), { searchExports: true })!;
});

const useLocation = cache(() => webpack.getModule<() => { pathname: string }>(filters.byStrings(").location}"), { searchExports: true })!);

function Navigatation() {
  const React = webpack.common.React!;
  const location = useLocation.getter();

  return (
    <aside className="vx-dashboard-navigation">
      <ul>
        <div style={{ height: 8 }} />
        <li className="vx-dashboard-navigation-button">
          <NavigatorButton.getter
            selected={location.pathname === "/vx"}
            route="/vx"
            text="Home"
            icon={Icons.Logo}
          />
        </li>
        <li className="vx-dashboard-navigation-button">
          <NavigatorButton.getter
            selected={location.pathname === "/vx/plugins"}
            route="/vx/plugins"
            text="Plugins"
            icon={Icons.Code}
          />
        </li>
        <li className="vx-dashboard-navigation-button">
          <NavigatorButton.getter
            selected={location.pathname === "/vx/themes"}
            route="/vx/themes"
            text="Themes"
            icon={Icons.Palette}
          />
        </li>
        <li className="vx-dashboard-navigation-button">
          <NavigatorButton.getter
            selected={location.pathname === "/vx/settings"}
            route="/vx/settings"
            text="Settings"
            icon={Icons.Gear}
          />
        </li>
        <li className="vx-dashboard-navigation-button">
          <NavigatorButton.getter
            text="Custom CSS"
            onClick={() => openWindow({ id: "vx/custom-css", title: "Custom CSS", render: CustomCSS })}
            icon={Icons.Brush}
          />
        </li>
      </ul>
    </aside>
  )
};

export default cache(() => webpack.common.React!.memo(Navigatation));