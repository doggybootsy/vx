import { Component } from "react";

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

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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

  static wrap = wrap;
};

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
  Wrapped.displayName = Component.displayName ? `VX(ErrorBoundary(${Component.displayName}))` : `VX(ErrorBoundary(${name}))`;
  
  Object.defineProperty(Wrapped, "name", {
    value: name,
    configurable: true
  });

  return Wrapped;
};

export default ErrorBoundary;