import { className, makeLazy, proxyCache } from "../util";
import { getProxyStore, getModuleIdBySource, webpackRequire, getByKeys, getProxyByKeys } from "../webpack";
import { useStateFromStores } from "../webpack/common";
import ErrorBoundary from "./boundary";

import "./colorpicker.css";
import { Tooltip } from "./tooltip";

interface ColorPickerProps {
  colors?: number[],
  defaultColor?: number,
  onChange(color: number): void,
  value: number | void,
  customPickerPosition?: "right",
  disabled?: boolean
};

const Components = getProxyByKeys([ "Spinner", "Tooltip" ]);

function getColorPicker() {
  try {
    return makeLazy({
      name: "ColorPicker",
      fallback() {
        return (
          <Tooltip text="Loading ColorPicker...">
            {(props) => (
              <div className="vx-colorpicker-loader" {...props}>
                <Components.Spinner className="vx-colorpicker-spinner" type={Components.Spinner.Type.SPINNING_CIRCLE} />
              </div>
            )}
          </Tooltip>
        )
      },
      factory: async () => {
        {
          const moduleIdRegex = /\(0,.{1,3}\.makeLazy\)\({createPromise:\(\)=>.{1,3}\..{1,3}\("(\d+?)"\).then\(.{1,3}.bind\(.{1,3},"\1"\)\),webpackId:"\1",name:"GuildSettings"}\)/;

          const moduleId = getModuleIdBySource("CollectiblesShop", "GuildSettings", "UserSettings")!;
      
          const module = String(webpackRequire!.m[moduleId]!);
      
          const [, matchedId ] = module.match(moduleIdRegex)!;
  
          await webpackRequire!.el(matchedId).then(webpackRequire!.bind(webpackRequire, matchedId));
        };

        const moduleIdRegex = /\(0,.{1,3}\.makeLazy\)\({createPromise:\(\)=>.{1,3}\..{1,3}\("(\d+?)"\).then\(.{1,3}.bind\(.{1,3},"\1"\)\),webpackId:"\1"}\)/;

        const moduleId = getModuleIdBySource(".Messages.USER_SETTINGS_PROFILE_COLOR_CUSTOM_BUTTON.format", ".DEFAULT_ROLE_COLOR,")!;
    
        const module = String(webpackRequire!.m[moduleId]!);
    
        const [, matchedId ] = module.match(moduleIdRegex)!;

        return webpackRequire!.el(matchedId).then(() => webpackRequire!(matchedId));
      }
    });
  } 
  catch (error) {}

  return () => null;
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
    props.defaultColor = isLightTheme ? 0xE3E5E8 : 0x202225;
  }
};

export function ColorPicker({ className: cn, ...props }: ColorPickerProps & { className?: string }) {
  ensureProps(props);

  return (
    <ErrorBoundary>
      <div className={className([ "vx-colorpicker", cn ])}>
        <ColorPickerModule {...props} />
      </div>
    </ErrorBoundary>
  )
};

ColorPicker.RolesColors = roleColors;