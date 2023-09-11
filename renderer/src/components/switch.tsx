import webpack from "renderer/webpack";
import { ErrorBoundary } from "renderer/components";

type HTMLDivProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>;

interface FormSwitchProps {
  value: boolean,
  onChange(newValue: boolean, event: React.ChangeEvent<HTMLInputElement>): void,
  disabled?: boolean,
  hideBorder?: boolean,
  tooltipNote?: React.ReactNode,
  className?: string,
  style?: HTMLDivProps["style"],
  note?: React.ReactNode,
  children: React.ReactNode
};

function Switch(props: FormSwitchProps): React.ReactElement {
  const React = webpack.common.React!;
  const components = webpack.common.components!;

  return (
    <ErrorBoundary>
      <components.FormSwitch {...props} />
    </ErrorBoundary>
  )
};

export default Switch;