import { Component, createElement } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode,
  fallback?: React.ReactNode
};

interface ErrorBoundaryState {
  hasError: boolean
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static Fallback() {
    return <div className="vx-react-error">React Error</div>
  }

  static wrap<P extends {}>(ComponentToWrap: React.ComponentType<P>, Fallback: React.ComponentType<P> = ErrorBoundary.Fallback): React.ComponentType<P> {
    class WrappedErrorBoundary extends Component<P> {
      static displayName: string;
      static {
        const name = ComponentToWrap.name || "anonymous";
        this.displayName = `VXErrorBoundary(${ComponentToWrap.displayName ? ComponentToWrap.displayName : name})`;

        Object.defineProperty(this, "name", {
          value: name
        });
      }

      render() {
        return (
          <ErrorBoundary fallback={<Fallback {...this.props} />}>
            <ComponentToWrap {...this.props} />
          </ErrorBoundary>
        )
      }
    }

    return WrappedErrorBoundary;
  }

  state = { hasError: false };

  componentDidCatch() {
    this.setState({
      hasError: true
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return <ErrorBoundary.Fallback />;
  }
}

export default ErrorBoundary;