import { useMemo, useState } from "react";
import { env, git } from "self";

import { LayerManager, WindowUtil } from "../webpack/common";
import { Home, Plugins, Themes } from "./pages";

import "./index.css";
import { className } from "../util";
import { openAlertModal } from "../api/modals";
import { SettingsView } from "../components";

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
  const [ section, setSection ] = useState(() => props.section);

  const sections = useMemo(() => [
    {
      section: "HEADER",
      label: "VX" 
    },
    { 
      section: "home", 
      label: "Home", 
      element: () => <Home />
    },
    { section: "DIVIDER" },
    {
      section: "HEADER",
      label: "Addons" 
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
    { section: "DIVIDER" },
    {
      section: "CUSTOM", 
      element: () => (
        <div className="vx-section-info">
          <div className="vx-section-version">
            <span>{`VX ${env.VERSION} `}</span>
            <span className={className([ "vx-section-hash", env.IS_DEV && "vx-section-devmode" ])}>({env.VERSION_HASH})</span>
          </div>
          {git.exists ? (
            <div 
              className="vx-section-git"
              onClick={(event) => {
                // I hate ts so damn much | Like this only exists when 'git.exists'
                if (!git.exists) return;

                WindowUtil.handleClick({
                  href: `${git.url}/tree/${git.hash}`
                }, event);
              }}
            >
              <span>{git.url.split("/").slice(-2).join("/")}{" "}</span>
              <span className="vx-section-hash">({git.hashShort})</span>
            </div>
          ) : (
            <div 
              className="vx-section-git"
              onClick={() => {
                openAlertModal("Github", [
                  "Current build has no git details!", 
                  "This is from your local machine (or the local machine that compiled VX) not having git installed when compiling VX"
                ]);
              }}
            >
              <span>???/???{" "}</span>
              <span className="vx-section-hash">(???????)</span>
            </div>
          )}
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