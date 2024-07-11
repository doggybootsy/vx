import ErrorBoundary from "./boundary";
import { SystemDesign } from "./util";

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
      <SystemDesign.Switch {...props} />
    </ErrorBoundary>
  )
}

export interface FormSwitchProps {
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
      <SystemDesign.FormSwitch {...props} />
    </ErrorBoundary>
  )
}