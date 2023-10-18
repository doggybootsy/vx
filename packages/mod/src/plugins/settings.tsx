import { DataStore } from "../api/storage";
import { ColorPicker, FormBody, FormSwitch, FormSwitchProps } from "../components";

export const enum SettingType {
  SWITCH,
  COLOR,
  INPUT,
  CUSTOM
};

interface SettingsCommon {
  title: string,
  description?: string,
  disabled?(): boolean
};

interface SwitchSettingType extends SettingsCommon {
  type: SettingType.SWITCH,
  props?: Omit<FormSwitchProps, "value" | "onChange" | "children" | "note">,
  default: boolean
};
interface ColorSettingType extends SettingsCommon {
  type: SettingType.COLOR,
  default: number
};
interface InputSettingType extends SettingsCommon {
  type: SettingType.INPUT,
  default: string,
  placeholder: string
};
export interface CustomSettingType<V> {
  type: SettingType.CUSTOM,
  default: V,
  render(props: { setState(state: V): void, state: V }): React.ReactNode
};

type SettingTypes = SwitchSettingType | ColorSettingType | InputSettingType | CustomSettingType<any>;

type GetCustomSettingType<T extends CustomSettingType<any>> = T extends CustomSettingType<infer P> ? P : never;
type GetSettingType<T extends SettingTypes> = T extends SwitchSettingType ? boolean : T extends ColorSettingType ? number : T extends InputSettingType ? string : T extends CustomSettingType<any> ? GetCustomSettingType<T> : unknown;

export interface CreatedSetting<T extends SettingTypes> {
  use(): GetSettingType<T>,
  get(): GetSettingType<T>,
  set(value: GetSettingType<T>): void,
  default: GetSettingType<T>,
  type: SettingType,
  render(): React.ReactNode
};

function getRender(element: SettingTypes, setting: CreatedSetting<any>) {
  if (element.type === SettingType.CUSTOM) {
    return () => (
      <element.render state={setting.use()} setState={setting.set} />
    )
  };

  if (element.type === SettingType.SWITCH) {
    const $setting = element as SwitchSettingType;
    const props = $setting.props ??= {};

    return () => {
      const value = setting.use() as boolean;
      const isDisabled = typeof $setting.disabled === "function" ? $setting.disabled() : false;

      return (
        <FormSwitch
          value={value}
          onChange={(value) => setting.set(value)}
          disabled={isDisabled}
          note={$setting.description}
          {...props}
        >{element.title}</FormSwitch>
      );
    }
  };
  if (element.type === SettingType.COLOR) {
    const $setting = element as ColorSettingType;

    return () => {
      const value = setting.use() as number;
      const isDisabled = typeof $setting.disabled === "function" ? $setting.disabled() : false;

      return (
        <FormBody title={element.title} description={element.description}>
          <ColorPicker
            onChange={(color) => setting.set(color)}
            value={value}
            disabled={isDisabled}
            defaultColor={$setting.default}
          />
        </FormBody>
      )
    };
  };

  return () => (
    <div>
      Setting Type '{element.type}' doesn't have a render!
    </div>
  );
};

export function createSettings<K extends Record<string, SettingTypes>>(pluginName: string, settings: K): { [key in keyof K]: CreatedSetting<K[key]> } {
  let dataStore: DataStore = new DataStore(pluginName);

  const result = { } as{ [key in keyof K]: CreatedSetting<K[key]> };

  for (const key in settings) {
    if (Object.prototype.hasOwnProperty.call(settings, key)) {
      const element = settings[key];

      const setting = {
        use() {
          const value = dataStore.use(key);
          
          if (value === undefined) return element.default;
          return value;
        },
        get() {
          if (!dataStore.has(key)) return element.default;
          return dataStore.get(key)!;
        },
        set(value) {
          dataStore.set(key, value);
        },
        default: element.default,
        type: element.type
      } as CreatedSetting<K[keyof K]>;

      setting.render = getRender(element, setting);

      result[key] = setting;
    };
  };

  return result;
};
