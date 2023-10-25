import { openAlertModal } from "../api/modals";
import { getProxyByProtoKeys } from "../webpack";
import { LayerManager, React } from "../webpack/common";
import { Home, Themes, Plugins } from "./pages";

import "./index.css";
import { className } from "../util";
import { env } from "self";
import { CustomCSS } from "./pages/customCSS";

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
      element: () => <CustomCSS />
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
            <span>{`VX ${env.VERSION} `}</span>
            <span
              className={className([ env.IS_DEV && "vx-section-devmode" ])}
            >({env.VERSION_HASH})</span>
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

export function openDashboard(section: string = "home") {
  LayerManager.pushLayer(() => (
    <Dashboard section={section} />
  ));
};