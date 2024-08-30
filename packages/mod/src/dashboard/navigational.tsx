import { bySource, getProxy, getProxyByKeys } from "@webpack";
import { className } from "../util";
import { Icons } from "../components";
import { NavigationUtils } from "@webpack/common";
import { InfoSection } from ".";

const scrollerClasses = getProxyByKeys([ "auto", "customTheme", "scrolling" ]);

// let {categories: t, currentCategoryId: n, handleCategorySelect: a, shouldDisplaySelectedCategory: r=!0} = e;
// return (0,
// i.jsx)(i.Fragment, {
//     children: t.map(e=>(0,
//     i.jsx)(s.Z, {
//         avatar: c(e.icon),
//         name: e.name,
//         focusProps: {
//             offset: {
//                 right: 4,
//                 top: 1,
//                 bottom: 1
//             }
//         },
//         onClick: ()=>a(e.categoryId),
//         wrapContent: !0,
//         selected: r && e.categoryId === n,
//         className: o.categoryItem,
//         selectedClassName: o.selectedCategoryItem,
//         innerClassName: o.itemInner
//     }, e.categoryId))

const CategoryItem = getProxy<{ default: any }>(bySource(".nameAndDecorators,children:[", "aria-selected"), { searchExports: false });
const categoryClasses = getProxyByKeys([ "itemInner", "categoryItem", "selectedCategoryItem"])

export function NavigationPanel() {
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
        className={categoryClasses.categoryItem}
        selectedClassName={categoryClasses.selectedCategoryItem}
        innerClassName={categoryClasses.innerClassName}
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
        className={categoryClasses.categoryItem}
        selectedClassName={categoryClasses.selectedCategoryItem}
        innerClassName={categoryClasses.innerClassName}
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
        className={categoryClasses.categoryItem}
        selectedClassName={categoryClasses.selectedCategoryItem}
        innerClassName={categoryClasses.innerClassName}
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
        className={categoryClasses.categoryItem}
        selectedClassName={categoryClasses.selectedCategoryItem}
        innerClassName={categoryClasses.innerClassName}
        onClick={() => {
          NavigationUtils.transitionTo("/vx/community/themes");
        }}
      />
      <div className="vx-dashboard-navigation-spacer" />
      <InfoSection isMenu={false} />
    </div>
  )
}