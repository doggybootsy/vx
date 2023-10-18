import { findInReactTree, proxyCache, wrapInHooks } from "../util";
import { getByStrings, getStore, byStrings, getProxyStore } from "../webpack";
import { React, useStateFromStores } from "../webpack/common";
import ErrorBoundary from "./boundary";

interface ColorPickerProps {
  colors?: number[],
  defaultColor?: number,
  onChange(color: number): void,
  value: number | void,
  customPickerPosition?: "right",
  disabled?: boolean
};

function getColorPicker() {
  const dummyGuild = {
    id: "", 
    hasFeature() { return false },
    isOwner() { return false }
  };
  
  const GuildLayer = getByStrings<React.FunctionComponent<any>>([ "canAccessGuildSettings", "GUILD_ANALYTICS_MEMBER_INSIGHTS_FETCH_SUCCESS" ])!;

  const res = findInReactTree<{ type: typeof React.Component }>(wrapInHooks(GuildLayer)({ }), (item) => {
    if (!item?.type?.prototype) return;
    return item.type.prototype instanceof React.Component;
  })!;

  const layer = new res.type({
    guild: dummyGuild
  });

  const rendered = layer.render();

  const SettingsView = findInReactTree<{
    sections: { section: string, element(): React.ReactElement }[]
  }>(rendered, (node) => node?.sections)!;

  const rolesSection = SettingsView.sections.find((section) => section.section === "ROLES")!;
  
  const GuildSettingsStore = getStore("GuildSettingsStore");

  GuildSettingsStore.getSelectedRoleId = () => dummyGuild.id;

  const GuildSettingsRolesStore = Object.getPrototypeOf(getStore("GuildSettingsRolesStore"));
  const guildDescriptor = Object.getOwnPropertyDescriptor(GuildSettingsRolesStore, "guild")!;
  const rolesDescriptor = Object.getOwnPropertyDescriptor(GuildSettingsRolesStore, "roles")!;
  const getRole = GuildSettingsRolesStore.getRole;
  GuildSettingsRolesStore.getRole = () => dummyGuild;

  Object.defineProperty(GuildSettingsRolesStore, "guild", {
    configurable: true,
    enumerable: false,
    get() { return dummyGuild }
  });
  Object.defineProperty(GuildSettingsRolesStore, "roles", {
    configurable: true,
    enumerable: false,
    get() { return [ dummyGuild ] }
  });

  const result = wrapInHooks(rolesSection.element)({ })! as { type: React.FunctionComponent<any> };
  
  const resultant = wrapInHooks(result.type)({ 
    everyoneRole: dummyGuild,
    selectedSection: 0
  });  

  const idk = findInReactTree<{ type: React.FunctionComponent<any>, props: any }>(resultant, (item) => byStrings(".setSelectedSection", "().noticeContainer")(item?.type))!;

  const editRolesPage = wrapInHooks(idk.type)(idk.props);

  const colorPickerWrapper = findInReactTree<{ type: React.FunctionComponent<any>, props: any }>(editRolesPage, (item) => byStrings(".Messages.FORM_LABEL_ROLE_COLOR", ".Messages.ROLE_COLOR_HELP")(item?.type))!;

  const colorPicker = wrapInHooks(colorPickerWrapper.type)(colorPickerWrapper.props);

  const ColorPicker = findInReactTree<{ type: React.FunctionComponent<ColorPickerProps> }>(colorPicker, (item) => item?.type?.displayName)!;

  Object.defineProperty(GuildSettingsRolesStore, "guild", guildDescriptor);
  Object.defineProperty(GuildSettingsRolesStore, "roles", rolesDescriptor);
  GuildSettingsRolesStore.getRole = getRole;
  delete GuildSettingsStore.getSelectedRoleId;

  return ColorPicker.type;
};

const ColorPickerModule = proxyCache(getColorPicker);

const roleColors = [
  0x1ABC9C,
  0x2ECC71,
  0x3498DB,
  0x9B59B6,
  0xE91E63,
  0xF1C40F,
  0xE67E22,
  0xE74C3C,
  0x95A5A6,
  0x607D8B,
  0x11806A,
  0x1F8B4C,
  0x206694,
  0x71368A,
  0xAD1457,
  0xC27C0E,
  0xA84300,
  0x992D22,
  0x979C9F,
  0x546E7A
];

const ThemeStore = getProxyStore("ThemeStore");
function ensureProps(props: ColorPickerProps) {
  const isLightTheme = useStateFromStores([ ThemeStore ], () => ThemeStore.theme === "light");

  if (!Array.isArray(props.colors)) {
    props.colors = roleColors;
  }
  if (typeof props.defaultColor !== "number") {
    props.defaultColor = isLightTheme ? 14935528 : 2105893;
  }
};

export function ColorPicker(props: ColorPickerProps) {
  ensureProps(props);

  return (
    <ErrorBoundary>
      <ColorPickerModule {...props} />
    </ErrorBoundary>
  )
};

ColorPicker.RolesColors = roleColors;