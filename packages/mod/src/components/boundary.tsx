import { React } from "./../webpack/common";
import { cacheComponent } from "./../util";

interface ErrorBoundaryProps {
  children: React.ReactNode,
  fallback?: React.ReactNode
};

interface ErrorBoundaryState {
  hasError: boolean
};

const NoFallback = () => (
  <div className="vx-react-error">React Error</div>
);

const ErrorBoundary = cacheComponent(() => {
  class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state = { hasError: false };

    componentDidCatch() {
      this.setState({
        hasError: true
      });
    };

    render() {
      if (!this.state.hasError) return this.props.children;
      if (this.props.fallback) return this.props.fallback;
      return <NoFallback />;
    };
  };

  return ErrorBoundary;
}) as React.FunctionComponent<ErrorBoundaryProps> & { wrap: typeof wrap };

function wrap<P extends {}>(Component: React.JSXElementConstructor<P>, Fallback: React.FunctionComponent<P> = NoFallback): React.FunctionComponent<P> {
  function Wrapped(props: P) {
    return (
      <ErrorBoundary fallback={<Fallback {...props} />}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  const name = Component.name ? Component.name : "anonymous";

  // @ts-expect-error
  Wrapped.displayName = Component.displayName ? `VX-Wrapped(${Component.displayName})` : `VX-Wrapped(${name})`;
  
  Object.defineProperty(Wrapped, "name", {
    value: name,
    configurable: true
  });

  return Wrapped;
};

ErrorBoundary.wrap = wrap;

export default ErrorBoundary;