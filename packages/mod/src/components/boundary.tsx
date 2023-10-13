import { React } from "./../webpack/common";
import { proxyCache } from "./../util";

interface ErrorBoundaryProps {
  children: React.ReactNode,
  fallback?: React.ReactNode
};

interface ErrorBoundaryState {
  hasError: boolean
};

const ErrorBoundary = proxyCache(() => {
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

export default ErrorBoundary;