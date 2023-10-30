import { getProxyByKeys } from "../webpack";
import ErrorBoundary from "./boundary";

interface Flex extends React.FunctionComponent<FlexProps> {
  Align: Align,
  Direction: Direction,
  Justify: Justify,
  Wrap: Wrap,
  Child: React.FunctionComponent<FlexChildProps>
};

const FlexModule = getProxyByKeys<Flex>([ "Align", "Child", "Wrap" ]);

interface FlexProps extends React.DetailedHTMLProps<React.HTMLProps<HTMLDivElement>, HTMLDivElement> {
  className?: string,
  justify?: string,
  direction?: string,
  align?: string,
  wrap?: string,
  style?: React.CSSProperties,
  shrink?: React.CSSProperties["flexShrink"],
  grow?: React.CSSProperties["flexGrow"],
  basis?: React.CSSProperties["flexBasis"],
  gap?: React.CSSProperties["gap"]
};

interface FlexChildProps extends React.DetailedHTMLProps<React.HTMLProps<HTMLDivElement>, HTMLDivElement> {
  className?: string,
  wrap?: string,
  style?: React.CSSProperties,
  shrink?: React.CSSProperties["flexShrink"],
  grow?: React.CSSProperties["flexGrow"],
  basis?: React.CSSProperties["flexBasis"]
};

interface Align {
  START: string,
  END: string,
  CENTER: string,
  STRETCH: string,
  BASELINE: string
};
interface Direction {
  VERTICAL: string,
  HORIZONTAL: string,
  HORIZONTAL_REVERSE: string
};
interface Justify {
  START: string,
  END: string,
  CENTER: string,
  BETWEEN: string,
  AROUND: string
};
interface Wrap {
  NO_WRAP: string,
  WRAP: string,
  WRAP_REVERSE: string
};

function handleProps(props: FlexProps) {
  // FlexProps.gap is a custom thing | so we add it to style
  props.style ??= {};
  props.style.gap = props.gap;
};

function WrappedFlex(props: FlexProps) {
  handleProps(props);

  return (
    <ErrorBoundary>
      <FlexModule {...props} />
    </ErrorBoundary>
  );
};

Object.defineProperties(WrappedFlex, {
  Align: {
    get: () => FlexModule.Align
  },
  Direction: {
    get: () => FlexModule.Direction
  },
  Justify: {
    get: () => FlexModule.Justify
  },
  Wrap: {
    get: () => FlexModule.Wrap
  },
  Child: {
    get: () => FlexChild
  }
});

export const Flex = WrappedFlex as Flex;

export function FlexChild(props: FlexChildProps) {
  return (
    <ErrorBoundary>
      <FlexModule.Child {...props} />
    </ErrorBoundary>
  );
};