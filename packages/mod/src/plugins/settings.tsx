import { DataStore } from "../api/storage";
import { ColorPicker, FormBody, FormSwitch, FormSwitchProps } from "../components";

export const enum SettingType {
  SWITCH,
  COLOR,
  INPUT,
  CUSTOM
}

interface SettingsCommon<T> {
  title: string,
  description?: string,
  default: T,
  // How does one type this, so it shows all of the settings? Because SettingTypes can't be used in itself
  disabled?(settings: CreatedSettings<Record<string, SettingTypes>>): boolean,
  onChange?(state: T): void
}

interface SwitchSettingType extends SettingsCommon<boolean> {
  type: SettingType.SWITCH,
  props?: Omit<FormSwitchProps, "disabled" | "value" | "onChange" | "children" | "note">
}
interface ColorSettingType extends SettingsCommon<number> {
  type: SettingType.COLOR
}
interface InputSettingType extends SettingsCommon<string> {
  type: SettingType.INPUT,
  placeholder: string
}

export interface CustomSettingType<V> {
  type: SettingType.CUSTOM,
  default: V,
  render?(props: { setState(state: V): void, state: V }): React.ReactNode,
  onChange?(settings: V): void
}

type SettingTypes = SwitchSettingType | ColorSettingType | InputSettingType | CustomSettingType<any>;

type GetCustomSettingType<T extends CustomSettingType<any>> = T extends CustomSettingType<infer P> ? P : never;
type GetSettingType<T extends SettingTypes> = T extends SwitchSettingType ? boolean : T extends ColorSettingType ? number : T extends InputSettingType ? string : T extends CustomSettingType<any> ? GetCustomSettingType<T> : unknown;

export interface CreatedSetting<T extends SettingTypes> {
  use(): GetSettingType<T>,
  get(): GetSettingType<T>,
  set(value: GetSettingType<T>): void,
  reset(): void,
  default: GetSettingType<T>,
  type: SettingType,
  render(): React.ReactNode
};

function getRender(element: SettingTypes, setting: CreatedSetting<SettingTypes>, settings: CreatedSettings<Record<string, SettingTypes>>) {
  function set(value: any) {
    setting.set(value);
    if (typeof element.onChange === "function") element.onChange(value as never);
  }

  if (element.type === SettingType.CUSTOM) {
    if (!element.render) return () => null;

    const Render = element.render;
    return () => (
      <Render 
        state={setting.use()} 
        setState={set} 
      />
    )
  }

  if (element.type === SettingType.SWITCH) {
    const $setting = element as SwitchSettingType;
    const props = $setting.props ??= {};

    return () => {
      const value = setting.use() as boolean;
      const isDisabled = typeof $setting.disabled === "function" ? $setting.disabled(settings) : false;

      return (
        <FormSwitch
          value={value}
          onChange={set}
          disabled={isDisabled}
          note={$setting.description}
          {...props}
        >{element.title}</FormSwitch>
      );
    }
  }
  if (element.type === SettingType.COLOR) {
    const $setting = element as ColorSettingType;

    return () => {
      const value = setting.use() as number;
      const isDisabled = typeof $setting.disabled === "function" ? $setting.disabled(settings) : false;

      return (
        <FormBody title={element.title} description={element.description}>
          <ColorPicker
            onChange={set}
            value={value}
            disabled={isDisabled}
            defaultColor={$setting.default}
          />
        </FormBody>
      )
    };
  }

  return () => (
    <div>
      Setting Type '{element.type}' doesn't have a render!
    </div>
  );
}

type CreatedSettings<K extends Record<string, SettingTypes>> = { [key in keyof K]: CreatedSetting<K[key]> };

export function createSettings<K extends Record<string, SettingTypes>>(pluginName: string, settings: K): CreatedSettings<K> {
  let dataStore: DataStore = new DataStore(pluginName);

  const result = { } as CreatedSettings<K>;

  for (const key in settings) {
    if (Object.prototype.hasOwnProperty.call(settings, key)) {
      const element = settings[key];

      const setting: CreatedSetting<K[keyof K]> = {
        use() {
          const value = dataStore.use(key);
          
          if (!dataStore.has(key)) return element.default;
          return value;
        },
        get() {
          if (!dataStore.has(key)) return element.default;
          return dataStore.get(key)!;
        },
        set(value) {
          dataStore.set(key, value);
        },
        reset() {
          dataStore.set(key, element.default);
        },
        render: () => null,
        default: element.default,
        type: element.type
      };

      setting.render = getRender(element, setting, result);

      result[key] = setting;
    }
  }

  return result;
}