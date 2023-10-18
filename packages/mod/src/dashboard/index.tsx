import { openAlertModal } from "../api/modals";
import { byStrings, getProxy, getProxyByProtoKeys, getProxyByStrings, whenWebpackReady } from "../webpack";
import { LayerManager, React } from "../webpack/common";
import { Home, Themes, Plugins } from "./pages";

import "./index.css";
import { InternalStore, className } from "../util";
import { plainTextPatches } from "../webpack/patches";
import { Icons } from "../components";
import { openWindow } from "../customCSS";
import { env } from "self";

const SettingsView = getProxyByProtoKeys<any>([ "renderSidebar" ]);

export function Panel(props: {
  title: React.ReactNode,
  buttons?: React.ReactNode,
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="vx-section-header">
        <div className="vx-section-title">
          {props.title}
        </div>
        <div className="vx-section-buttons">
          {props.buttons}
        </div>
      </div>
      {props.children}
    </div>
  )
};

function Dashboard(props: { section: string }) {
  const [ section, setSection ] = React.useState(() => props.section);

  const sections = React.useMemo(() => [
    {
      section: "HEADER",
      label: "VX" 
    },
    { 
      section: "home", 
      label: "Home", 
      element: () => <Home />
    },
    {
      section: "plugins",
      label: "Plugins",
      element: () => <Plugins />
    },
    { 
      section: "themes", 
      label: "Themes",
      element: () => <Themes />
    },
    { 
      section: "custom-css", 
      label: "Custom CSS",
      onClick() {
        openWindow();
      }
    },
    { section: "DIVIDER" },
    {
      section: "change-log",
      label: "Changelog",
      onClick() {
        openAlertModal("Changelog", [ "Not added yet" ]);
      }
    },
    { section: "DIVIDER" },
    {
      section: "CUSTOM", 
      element: () => (
        <div className="vx-section-info">
          <div className="vx-section-version">
            VX
            {" "}
            <span
              className={className([ env.IS_DEV && "vx-section-devmode" ])}
            >{env.VERSION}</span>
          </div>
        </div>
      )
    }
  ], [ ]);

  return (
    <SettingsView 
      sections={sections}
      section={section}
      onClose={LayerManager.popLayer}
      onSetSection={setSection}
    />
  )
};

function openDashboard(section: string = "home") {
  LayerManager.pushLayer(() => (
    <Dashboard section={section} />
  ));
};

plainTextPatches.push(
  {
    identifier: "VX(private-channels-list)",
    match: ".showDMHeader",
    replacements: [
      {
        find: /,(.{1,3})=(.{1,3}\.children)/,
        replace: ",$1=window.VX._self._addNavigatorButton($2)"
      }
    ]
  }
);

const filter = byStrings("linkButtonIcon", ".linkButton,");
const NavigatorButton = getProxy<React.FunctionComponent<any>>((m) => m.prototype && filter(m.prototype.render), { searchExports: true })

export function _addNavigatorButton(children: React.ReactNode[]) {  
  return [
    ...children,
    <NavigatorButton 
      selected={false}
      text="VX"
      key="vx-navigation-button"
      onClick={() => {
        openDashboard();
      }}
      icon={Icons.Logo}
    />
  ];
};
