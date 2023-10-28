import { proxyCache } from "../util";
import { getProxyStore, getModuleIdBySource, webpackRequire, getByKeys } from "../webpack";
import { useStateFromStores } from "../webpack/common";
import ErrorBoundary from "./boundary";

interface ColorPickerProps {
  colors?: number[],
  defaultColor?: number,
  onChange(color: number): void,
  value: number | void,
  customPickerPosition?: "right",
  disabled?: boolean
};

const moduleIdRegex = /\(0,.{1,3}\.makeLazy\)\({createPromise:\(\)=>.{1,3}.el\("(\d+?)"\).then\(.{1,3}.bind\(.{1,3},"\1"\)\),webpackId:"\1"}\)/;

function getColorPicker(): React.FunctionComponent<ColorPickerProps> {
  try {
    const lazyLib = getByKeys<any>([ "LazyLibrary", "makeLazy" ]);

    const moduleId = getModuleIdBySource("Color.WHITE_500:", ".DEFAULT_ROLE_COLOR,")!;

    const module = String(webpackRequire!.m[moduleId]!);

    const [, matchedId ] = module.match(moduleIdRegex)!;
    
    return lazyLib.makeLazy({
      createPromise: () => webpackRequire!.el(matchedId).then(webpackRequire!.bind(webpackRequire, matchedId))
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

export function ColorPicker(props: ColorPickerProps) {
  ensureProps(props);

  return (
    <ErrorBoundary>
      <ColorPickerModule {...props} />
    </ErrorBoundary>
  )
};

ColorPicker.RolesColors = roleColors;