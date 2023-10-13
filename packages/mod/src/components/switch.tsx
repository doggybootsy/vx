import { getProxyByKeys } from "../webpack";
import ErrorBoundary from "./boundary";

const components = getProxyByKeys<{
  Switch: React.FunctionComponent<SwitchProps>,
  FormSwitch: React.FunctionComponent<FormSwitchProps>
}>([ "Switch", "FormSwitch" ]);

interface SwitchProps {
  id?: string,
  onChange(value: boolean): void,
  checked: boolean,
  disabled?: boolean,
  className?: string
};

export function Switch(props: SwitchProps) {
  return (
    <ErrorBoundary>
      <components.Switch {...props} />
    </ErrorBoundary>
  );
};

interface FormSwitchProps {
  value: boolean,
  disabled?: boolean,
  hideBorder?: boolean,
  tooltipNote?: string,
  onChange(value: boolean): void,
  className?: string,
  style?: React.CSSProperties,
  note?: React.ReactNode,
  children: React.ReactNode
};

export function FormSwitch(props: FormSwitchProps) {
  return (
    <ErrorBoundary>
      <components.FormSwitch {...props} />
    </ErrorBoundary>
  );
};