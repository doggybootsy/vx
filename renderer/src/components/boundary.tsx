import { cache } from "renderer/util";
import webpack from "renderer/webpack";

interface ErrorBoundaryProps {
  children: React.ReactNode,
  fallback?: React.ReactNode
};

interface ErrorBoundaryState {
  hasError: boolean
};

const ErrorBoundary = cache(() => {
  const React = webpack.common.React!;

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
      return (
        <div className="vx-react-error">React Error</div>
      );
    };
  };

  return ErrorBoundary;
});

function WrappedErrorBoundary(props: ErrorBoundaryProps) {
  const React = webpack.common.React!;

  return <ErrorBoundary.getter {...props} />
};

export default WrappedErrorBoundary;