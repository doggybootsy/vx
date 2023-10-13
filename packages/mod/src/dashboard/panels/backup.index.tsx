import { Icons } from "../../components";
import { getComponentType } from "../../util";
import { byKeys, byRegex, byStrings, combine, getMangledProxy, getProxy, getProxyByProtoKeys, getProxyStore, whenWebpackReady } from "../../webpack";
import { LayerManager, React, useStateFromStores } from "../../webpack/common";
import { ChannelsList } from "../patch";
import { Home } from "./home";

import "./index.css";
import { Plugins } from "./plugins";

interface ReactRouter {
  Redirect: React.FunctionComponent<{ to: string }>,
  useMatch(path?: string): any,
  useLocation(): any,
  usePath(): any,
  match(path1: string, path2: string): any
};
export const ReactRouter = getMangledProxy<ReactRouter>("Router-History", {
  Redirect: byStrings(".computedMatch", ".staticContext"),
  useMatch: byStrings(".pathname,", ".match;"),
  useLocation: byStrings(").location}"),
  usePath: byRegex(/0;return .{1,3}\(.{1,3}\)}$/),
  match: byStrings("||Array.isArray(", ").reduce((function(")
});

export const HeaderBar = getProxy<React.FunctionComponent<any> & Record<string, React.FunctionComponent<any>>>(combine(byKeys("Icon", "Title"), byStrings(".GUILD_HOME")));

const navButtonFilter = byStrings("linkButtonIcon", ".linkButton,");
export const NavigatorButton = getProxy<any>((m) => m.prototype && navButtonFilter(m.prototype.render), { searchExports: true });

const filter = byStrings("guildsnav");
// getProxy doesnt work, why? Because idk 
const GuildsList = getMangledProxy<any>("guildsnav", {
  default: m => filter(getComponentType(m))
});

const NoticeStore = getProxyStore("NoticeStore");

const navFilter = byStrings("window.location.pathname");
function PatchedChannelsList() {
  const hasNotice = useStateFromStores([ NoticeStore ], () => NoticeStore.hasNotice());

  const res = ChannelsList({
    hasNotice,
    hideSidebar: false,
    sidebarTheme: "dark"
  });

  const children = res.props.children.filter((child: any) => {
    if (!(child instanceof Object)) return true;
    
    return !navFilter(getComponentType(child.type));
  });

  children.unshift(
    <div className="vx-dashboard-navigation">
      <div className="vx-dashboard-title">
        VX
      </div>
      <nav className="vx-dashboard-nav">
        <ul>
          <div style={{ height: 8 }} />
          <li className="vx-dashboard-navbutton">
            
          </li>
        </ul>
      </nav>
    </div>
  );  

  return React.cloneElement(res, {
    ...res.props,
    children
  });
};

export function Page(props: {
  toolbar?: React.ReactNode,
  header: React.ReactNode,
  children: React.ReactNode
}) {
  const toolbar = [ props.toolbar ];

  return (
    <div className="vx-dashboard-container">
      <div className="vx-dashboard-wrapper">
        <div className="vx-dashboard-sidebar">
          <PatchedChannelsList />
        </div>
        <div className="vx-dashboard">
          <HeaderBar
            toolbar={toolbar}
            mobileToolbar={toolbar}
          >
            {props.header}
          </HeaderBar>
          <div className="vx-dashboard-content">
            <main className="vx-dashboard-main">
              {props.children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
};

const SettingsView = getProxyByProtoKeys<any>([ "renderSidebar" ]);

export default function Dashboard() {
  const [ section, setSection ] = React.useState("home");

  return (
    <SettingsView 
      sections={[
        { section: "HEADER", label: "VX" },
        { section: "home", label: "Home", element: () => "Home" },
        { section: "plugins", label: "Plugins", element: () => "Plugins" }
      ]}
      section={section}
      onClose={LayerManager.popLayer}
      onSetSection={setSection}
    />
  )
};

whenWebpackReady().then(() => {
  LayerManager.pushLayer(Dashboard);
});