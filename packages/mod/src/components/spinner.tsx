import { className } from "../util";
import { getProxyByKeys } from "../webpack";
import ErrorBoundary from "./boundary";

type HTMLDivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

interface SpinnerProps extends Omit<HTMLDivProps, "children"> {
  type?: typeof Type[keyof typeof Type], 
  animated?: boolean, 
  className?: string, 
  itemClassName?: string
};

const Components = getProxyByKeys([ "Spinner", "Button" ]);

const Type = {
  WANDERING_CUBES: "wanderingCubes",
  CHASING_DOTS: "chasingDots",
  PULSING_ELLIPSIS: "pulsingEllipsis",
  SPINNING_CIRCLE: "spinningCircle",
  SPINNING_CIRCLE_SIMPLE: "spinningCircleSimple",
  LOW_MOTION: "lowMotion"
};

export function Spinner(props: SpinnerProps) {
  const cn = className([ props.className, "vx-spinner" ]);

  return (
    <ErrorBoundary>
      <Components.Spinner {...props} className={cn} />
    </ErrorBoundary>
  );
};
Spinner.Type = Type;