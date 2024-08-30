import { useEffect, useMemo, useState } from "react";
import { IS_DESKTOP, env, git } from "vx:self";

import { LayerManager } from "@webpack/common";
import { Home, Plugins, Themes } from "./pages";

import "./index.css";
import { className, createState } from "../util";
import { openAlertModal, openExternalWindowModal } from "../api/modals";
import { Icons, SettingsView, Tooltip } from "../components";
import { Extensions } from "./pages/extension";
import { Messages } from "vx:i18n";

import "./patches";
import { CommunityThemes } from "./pages/community/themes";

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
}

const [ isDashboardOpen, setDashboardState ] = createState(false);

export { isDashboardOpen };

export function InfoSection({ isMenu }: { isMenu: boolean }) {
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

  return (
    <div className={className([ "vx-section-info", isMenu && "vx-section-info-menu" ])}>
      <div className="vx-section-version">
        <span>{`${Messages.VX} ${env.VERSION} `}</span>
        <Tooltip shouldShow={env.IS_DEV} text="VX is in dev mode">
          {(props) => (
            <span {...props} className={className([ "vx-section-hash", env.IS_DEV && "vx-section-devmode" ])}>(space)</span>
          )}
        </Tooltip>
      </div>
      {git.exists ? (
        <div 
          className="vx-section-git"
          onClick={() => {
            if (!git.exists) return;

            openExternalWindowModal(`${git.url}/tree/${git.hash}`);
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
  )
}

function Dashboard(props: { section: string }) {
  const [ section, setSection ] = useState(() => props.section);

  useEffect(() => {
    return () => void setDashboardState(false);
  }, [ ]);

  const sections = useMemo(() => [
    SettingsView.Sections.Header(Messages.VX),
    SettingsView.Sections.View({
      label: Messages.HOME,
      section: "home",
      element: () => <Home />
    }),
    SettingsView.Sections.Divider(),
    SettingsView.Sections.Header(Messages.ADDONS),
    SettingsView.Sections.View({
      label: Messages.PLUGINS,
      section: "plugins",
      element: () => <Plugins />
    }),
    SettingsView.Sections.View({
      label: Messages.THEMES,
      section: "themes",
      element: () => <Themes />
    }),
    SettingsView.Sections.Divider(),
    SettingsView.Sections.Header({
      label: "Community",
      icon: Icons.Store
    }),
    SettingsView.Sections.View({
      label: Messages.THEMES,
      section: "community-themes",
      element: () => <CommunityThemes />
    }),
    SettingsView.Sections.Divider(),
    SettingsView.Sections.Header({
      label: Messages.DESKTOP,
      predicate: () => IS_DESKTOP
    }),
    SettingsView.Sections.View({
      label: Messages.EXTENSIONS,
      section: "extensions",
      element: () => <Extensions />,
      predicate: () => IS_DESKTOP
    }),
    SettingsView.Sections.Divider(() => IS_DESKTOP),
    SettingsView.Sections.Custom(() => <InfoSection isMenu={false} />)
  ], [ ]);

  return (
    <SettingsView 
      sections={sections}
      section={section}
      onClose={LayerManager.pop}
      onSetSection={setSection}
    />
  )
}

export function openDashboard(section: string = "home") {
  if (isDashboardOpen()) return;
  setDashboardState(true);

  LayerManager.push(() => (
    <Dashboard section={section} />
  ));
}