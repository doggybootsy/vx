import { useMemo, useState } from "react";
import { IS_DESKTOP, env, git } from "self";

import { LayerManager, WindowUtil } from "../webpack/common";
import { Home, Plugins, Themes } from "./pages";

import "./index.css";
import { className } from "../util";
import { openAlertModal } from "../api/modals";
import { Icons, SettingsView } from "../components";
import { Extensions } from "./pages/extension";
import { Community } from "./pages/community";

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
  const [ SHOW_COMMUNITY ] = useState(() => "$$_VX" in String && Boolean((String as any).$$_VX.SHOW_COMMUNITY_TABS_CONCEPT));
  const [ section, setSection ] = useState(() => props.section);

  // Add electron to the list of versions | This is because discord doesn't
  const electronVersionSection = useMemo(() => {
    const match = navigator.userAgent.match(/electron\/((?:\d+\.){1,}\d+)/i);
    if (!match) return null;

    return (
      <div className="vx-section-version">
        <span>{`Electron ${match.at(1)}`}</span>
      </div>
    )
  }, [ ]);

  const sections = useMemo(() => [
    SettingsView.Sections.Header("VX"),
    SettingsView.Sections.View({
      label: "Home",
      element: () => <Home />
    }),
    SettingsView.Sections.Divider(),
    SettingsView.Sections.Header("Addons"),
    SettingsView.Sections.View({
      label: "Plugins",
      element: () => <Plugins />
    }),
    SettingsView.Sections.View({
      label: "Themes",
      element: () => <Themes />
    }),
    SettingsView.Sections.Divider(),
    SettingsView.Sections.Header({
      label: "Community",
      icon: <Icons.Store size={18} />,
      predicate: () => SHOW_COMMUNITY
    }),
    SettingsView.Sections.View({
      label: "Plugins",
      section: "community-plugins",
      element: () => <Community title="Plugins" />,
      predicate: () => SHOW_COMMUNITY
    }),
    SettingsView.Sections.View({
      label: "Themes",
      section: "community-themes",
      element: () => <Community title="Themes" />,
      predicate: () => SHOW_COMMUNITY
    }),
    SettingsView.Sections.Divider(() => SHOW_COMMUNITY),
    SettingsView.Sections.Header({
      label: "Desktop",
      predicate: () => IS_DESKTOP
    }),
    SettingsView.Sections.View({
      label: "Extensions",
      element: () => <Extensions />,
      predicate: () => IS_DESKTOP
    }),
    SettingsView.Sections.Divider(() => IS_DESKTOP),
    SettingsView.Sections.Custom(() => (
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
        {electronVersionSection}
      </div>
    ))
  ], [ ]);

  return (
    <SettingsView 
      sections={sections}
      section={section}
      onClose={LayerManager.pop}
      onSetSection={setSection}
    />
  )
};

export function openDashboard(section: string = "home") {
  LayerManager.push(() => (
    <Dashboard section={section} />
  ));
};