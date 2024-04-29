import { Component, useMemo } from "react";
import { Button } from ".";

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
  static FallbackView(props: { showReloadButton?: boolean, closeAction?(): void }) {
    const { showReloadButton = false } = props;

    const buttons = useMemo(() => {
      const buttons: React.ReactNode[] = [];

      if (showReloadButton) {
        buttons.push(
          <Button onClick={() => location.reload()} size={Button.Sizes.LARGE} key="reload">
            Reload
          </Button>
        )
      }

      return buttons;
    }, [ showReloadButton ]);

    return (
      <div className="vx-react-error-view">
        {props.closeAction && (
          <div className="vx-react-error-view-tools-container">
            <div className="vx-react-error-view-tools">
              <div className="vx-react-error-view-close-container">
                <div className="vx-react-error-view-close-button" onClick={props.closeAction}>
                  <svg width={18} height={18} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
                  </svg>
                </div>
                <div className="vx-react-error-view-keybind">ESC</div>
              </div>
            </div>
          </div>
        )}
        <div className="vx-react-error-view-flex">
          <div className="vx-react-error-view-image" />
          <div className="vx-react-error-view-text">
            <h2 className="vx-react-error-view-title">
              Well, this is awkward
            </h2>
            <div className="vx-react-error-view-note">
              <div>
                <p>Looks like Discord has crashed unexpectedly....</p>
              </div>
            </div>
          </div>
          {buttons.length ? (
            <div className="vx-react-error-view-buttons">
              {buttons}
            </div>
          ) : false}
        </div>
      </div>
    )
  }

  static decorator<T extends typeof React.Component>(fallback?: React.ComponentType<React.PropsWithRef<T>>) {
    return function(component: T): T {
      return ErrorBoundary.wrap(component, fallback as any) as any;
    }
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