import { getModuleIdBySource, webpackRequire, getByKeys, getByProtoKeys } from "../webpack";
import { LayerManager, React, WindowUtil } from "../webpack/common";
import { Home, Plugins, Themes } from "./pages";

import "./index.css";
import { className, proxyCache } from "../util";
import { env, git } from "self";
import { openAlertModal } from "../api/modals";
import { ErrorBoundary } from "../components";

const moduleIdRegex = /\(0,.{1,3}\.makeLazy\)\({createPromise:\(\)=>.{1,3}\..{1,3}\("(\d+?)"\).then\(.{1,3}.bind\(.{1,3},"\1"\)\),webpackId:"\1",name:"UserSettings"}\)/;

function getSettingsView() {
  const moduleId = getModuleIdBySource("CollectiblesShop", "GuildSettings", "UserSettings")!;

  const module = String(webpackRequire!.m[moduleId]!);

  const [, matchedId ] = module.match(moduleIdRegex)!;

  const lazyLib = getByKeys<any>([ "LazyLibrary", "makeLazy" ]);

  return lazyLib.makeLazy({
    name: "SettingsView",
    webpackId: matchedId,
    createPromise: async () => {
      await webpackRequire!.el(matchedId).then(webpackRequire!.bind(webpackRequire, matchedId));
      
      return { default: getByProtoKeys<any>([ "renderSidebar" ]) };
    }
  });
};

const SettingsView = proxyCache(getSettingsView);

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
                WindowUtil.handleClick({
                  href: `${git.url}/tree/${git.branch}`
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
    <ErrorBoundary>
      <SettingsView 
        sections={sections}
        section={section}
        onClose={LayerManager.popLayer}
        onSetSection={setSection}
      />
    </ErrorBoundary>
  )
};

export function openDashboard(section: string = "home") {
  LayerManager.pushLayer(() => (
    <Dashboard section={section} />
  ));
};