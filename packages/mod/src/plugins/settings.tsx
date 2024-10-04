import { DataStore } from "../api/storage";
import { ColorPicker, FormBody, FormSwitch, FormSwitchProps, SystemDesign } from "../components";

export const enum SettingType {
  SWITCH,
  COLOR,
  INPUT,
  SELECT,
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

type SelectSettingValue = string | { label: string, value: string };

type SelectSettingGetValue<T extends SelectSettingValue> = T extends { label: string, value: string } ? T["value"] : T;

interface SelectSettingType<V extends SelectSettingValue[]> extends SettingsCommon<SelectSettingGetValue<V[number]>> {
  type: SettingType.SELECT;
  choices: V;
  placeholder?: string;
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

interface SelectSettingType<V extends SelectSettingValue[]> extends SettingsCommon<SelectSettingGetValue<V[number]>> {
  type: SettingType.SELECT,
  choices: V,
  placeholder?: string
}

export interface CustomSettingType<V> {
  type: SettingType.CUSTOM,
  default: V,
  render?(props: { setState(state: V): void, state: V }): React.ReactNode,
  onChange?(settings: V): void
}

type SettingTypes =
    | SwitchSettingType
    | ColorSettingType
    | InputSettingType
    | SelectSettingType<string[] | { label: string, value: string }[]>
    | CustomSettingType<any>;

type GetCustomSettingType<T extends CustomSettingType<any>> = T extends CustomSettingType<infer P> ? P : never;
type GetSettingType<T extends SettingTypes> = T extends SwitchSettingType ? boolean : T extends ColorSettingType ? number : T extends InputSettingType ? string : T extends SelectSettingType<string[]> ? SelectSettingGetValue<T["choices"][number]> : T extends CustomSettingType<any> ? GetCustomSettingType<T> : unknown;

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
  if (element.type === SettingType.SELECT) {
    const $setting = element as SelectSettingType<string[] | { label: string, value: string }[]>;

    const options = $setting.choices.map((choice) => {
      if (typeof choice === "string") {
        return { label: choice, value: choice };
      }
      return { label: choice.label, value: choice.value };
    });

    return () => {
      const value = setting.use() as string;
      const isDisabled = typeof $setting.disabled === "function" ? $setting.disabled(settings) : false;

      return (
          <FormBody title={element.title} description={element.description}>
            <SystemDesign.Select
                options={options}
                placeholder={$setting.placeholder}
                select={set}
                serialize={(m: any) => String(m)}
                isSelected={(item: string) => item === value}
                value={value}
                isDisabled={isDisabled}
                closeOnSelect
            />
          </FormBody>
      )
    };
  }

  if (false && element.type === SettingType.INPUT) {
    const $setting = element as InputSettingType;

    return () => {
      const value = setting.use() as string;
      const isDisabled = typeof $setting.disabled === "function" ? $setting.disabled(settings) : false;

      return (
        <FormBody title={element.title} description={element.description}>
          <SystemDesign.TextInput 
            placeholder={$setting.placeholder}
            value={value}
            isDisabled={isDisabled}
            onChange={set}
          />
        </FormBody>
      )
    };
  }

  return () => (
    <div>
      Setting Type '{(element as any).type}' doesn't have a render!
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