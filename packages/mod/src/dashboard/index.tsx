import { useEffect, useMemo, useState } from "react";
import { IS_DESKTOP, env, git } from "vx:self";

import { LayerManager, NavigationUtils } from "@webpack/common";
import { Home, Plugins, Themes } from "./pages";

import "./index.css";
import { className, createState } from "../util";
import { openAlertModal, openExternalWindowModal } from "../api/modals";
import { Icons, SettingsView, Tooltip, TooltipProps } from "../components";
import { Extensions } from "./pages/extension";
import { Messages } from "vx:i18n";

import "./patches";
import { CommunityThemes } from "./pages/community/themes";
import { byKeys, byStrings, combine, getProxy, getProxyByKeys, whenWebpackReady } from "@webpack";
import { IconFullProps, IconProps } from "../components/icons";

interface HeaderProps {
  toolbar?: React.ReactNode,
  children?: React.ReactNode,
  childrenBottom?: React.ReactNode,
  transparent?: boolean,
  className?: string,
  innerClassName?: string,
}
interface HeaderTitleProps {
  className?: string, 
  wrapperClassName?: string, 
  children: React.ReactNode, 
  onContextMenu?: GetComponentProps<"div">["onContextMenu"], 
  onClick?: GetComponentProps<"div">["onClick"], 
  id?: string, 
  muted?: boolean, 
  level?: number
}
interface HeaderIconProps {
  className?: string, 
  iconClassName?: string, 
  children?: React.ReactNode, 
  selected?: boolean, 
  disabled?: boolean, 
  showBadge?: boolean, 
  badgePosition?: "top" | "bottom", 
  color?: React.CSSProperties["color"], 
  foreground?: React.CSSProperties["color"], 
  background?: React.CSSProperties["background"], 
  icon: React.ComponentType<IconFullProps>, 
  onClick?: GetComponentProps<"div">["onClick"], 
  onContextMenu?: GetComponentProps<"div">["onContextMenu"], 
  tooltip?: string, 
  tooltipColor?: TooltipProps["color"], 
  tooltipPosition?: TooltipProps["position"], 
  tooltipDisabled?: boolean, 
  hideOnClick?: boolean, 
  role?: GetComponentProps<"div">["role"], 
  "aria-label"?: string, 
  "aria-hidden"?: boolean, 
  "aria-checked"?: boolean, 
  "aria-expanded"?: boolean, 
  "aria-haspopup"?: boolean
}
interface HeaderDividerProps {
  className?: string
}
interface HeaderCaretProps {
  className?: string
}
interface Header extends React.FunctionComponent<HeaderProps> {
  Icon: React.FunctionComponent<HeaderIconProps>,
  Title: React.FunctionComponent<HeaderTitleProps>,
  Divider: React.FunctionComponent<HeaderDividerProps>,
  Caret: React.FunctionComponent<HeaderCaretProps>
}

export const Header = getProxy<Header>(combine(byKeys("Caret", "Divider", "Icon", "Title"), byStrings(".channelType")));

const scrollerClasses = getProxyByKeys([ "auto", "customTheme", "scrolling" ]);
const contentClasses = getProxyByKeys([ "chat", "uploadArea", "threadSidebarOpen" ]);
const pageClasses = getProxyByKeys([ "container", "inviteToolbar" ]);

export function Page(props: {
  title: string,
  icon: React.ComponentType<IconFullProps>,
  toolbar?: React.ReactNode,
  transparent?: boolean,
  children: React.ReactNode,
  headerClassName?: string,
  bodyClassName?: string,
  wrapperClassName?: string,
  className?: string,
}) {
  return (
    <div className={className([ "vx-page", pageClasses.container, props.className ])}>
      <Header
        toolbar={<>{props.toolbar}</>} 
        transparent={props.transparent}
        className={className([ "vx-page-header", props.headerClassName ])}
      >
        <Header.Icon icon={props.icon} />
        <Header.Title>{props.title}</Header.Title>
        {/* <Header.Divider /> */}
      </Header>
      <div className={className([ "vx-page-wrapper", contentClasses.content, props.wrapperClassName ])}>
        <div className={className([ "vx-page-body", scrollerClasses.auto, props.bodyClassName ])}>
          {props.children}
        </div>
      </div>
    </div>
  )
}

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

const COMMUNITY_PATH = "/vx/community/:type";
const PAGE_PATH = "/vx/:page";

function Dashboard({ match }: { match: { params: Record<string, string | void>, path: string } }) {
  const Component = useMemo(() => {
    const { params, path } = match;

    switch (path) {
      case COMMUNITY_PATH:
        if (params.type === "themes") return CommunityThemes;
        break;
    
      default:
        switch (params.page) {
          case "home":
            return Home;
          case "plugins":
            return Plugins;
          case "themes":
            return Themes;
        
          default:
            break;
        }

        break;
    }

    return () => "Unknown Page";
  }, [ match ]);

  return <Component />;
}

__addSelf("dashboardRouteProps", {
  path: [ COMMUNITY_PATH, PAGE_PATH ],
  render: (props: any) => <Dashboard {...props} />,
  disableTrack: true
});

{
  let routes: { path: string[], render: React.FunctionComponent<any> }[];
  
  Object.defineProperty(__addSelf.__self__, "routes", {
    get: () => routes,
    set: (v) => {
      routes = v;
      for (const route of routes) {
        if (route.path.length > 15) {
          route.path.push(__addSelf.__self__.dashboardRouteProps.path);
        }
      }
    }
  })
}

export function openDashboard(path: string = "/home") {
  NavigationUtils.transitionTo(`/vx${path}`);
}

const { search } = location;
if (search.startsWith("?__vx_dashboard_path__=")) {
  whenWebpackReady().then(() => {
    NavigationUtils.transitionTo(decodeURIComponent(search.replace("?__vx_dashboard_path__=", "")));
  });
}