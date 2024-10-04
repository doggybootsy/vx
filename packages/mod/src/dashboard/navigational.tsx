import { bySource, getProxy, getProxyByKeys } from "@webpack";
import { className } from "../util";
import { Icons } from "../components";
import { NavigationUtils } from "@webpack/common";
import { InfoSection } from ".";
import { IS_DESKTOP } from "vx:self";

const scrollerClasses = getProxyByKeys([ "auto", "customTheme", "scrolling" ]);

const CategoryItem = getProxy<{ default: any }>(bySource(".nameAndDecorators,children:[", "aria-selected"), { searchExports: false });

__self__.isVXPath = () => location.pathname.startsWith("/vx");
__self__.NavigationPanel = function NavigationPanel() {
  return (
    <div className={className([ "vx-dashboard-navigation", scrollerClasses.thin ])}>
      <h2 className="vx-dashboard-navigation-title">VX</h2>
      <CategoryItem.default
        wrapContent
        avatar={<Icons.Logo />}
        name="Home"
        focusProps={{
          offset: {
            right: 4,
            top: 1,
            bottom: 1
          }
        }}
        selected={location.pathname === "/vx/home"}
        onClick={() => {
          NavigationUtils.transitionTo("/vx/home");
        }}
      />
      <CategoryItem.default
        wrapContent
        avatar={<Icons.Code />}
        name="Plugins"
        focusProps={{
          offset: {
            right: 4,
            top: 1,
            bottom: 1
          }
        }}
        selected={location.pathname === "/vx/plugins"}
        onClick={() => {
          NavigationUtils.transitionTo("/vx/plugins");
        }}
      />
      <CategoryItem.default
        wrapContent
        avatar={<Icons.Palette />}
        name="Themes"
        focusProps={{
          offset: {
            right: 4,
            top: 1,
            bottom: 1
          }
        }}
        selected={location.pathname === "/vx/themes"}
        onClick={() => {
          NavigationUtils.transitionTo("/vx/themes");
        }}
      />
      <h2 className="vx-dashboard-navigation-subtitle">
        {/* <Icons.Store size={18} /> */}
        Community
      </h2>
      <CategoryItem.default
        wrapContent
        avatar={<Icons.Palette />}
        name="Themes"
        focusProps={{
          offset: {
            right: 4,
            top: 1,
            bottom: 1
          }
        }}
        selected={location.pathname === "/vx/community/themes"}
        onClick={() => {
          NavigationUtils.transitionTo("/vx/community/themes");
        }}
      />
      {IS_DESKTOP && (
        <>
          <h2 className="vx-dashboard-navigation-subtitle">
            Desktop
          </h2>
          <CategoryItem.default
            wrapContent
            avatar={<Icons.Puzzle />}
            name="Extensions"
            focusProps={{
              offset: {
                right: 4,
                top: 1,
                bottom: 1
              }
            }}
            selected={location.pathname === "/vx/extensions"}
            onClick={() => {
              NavigationUtils.transitionTo("/vx/extensions");
            }}
          />
        </>
      )}
      <div className="vx-dashboard-navigation-spacer" />
      <InfoSection isMenu={false} />
    </div>
  )
}