import { ErrorBoundary, Markdown } from "renderer/components";
import webpack from "renderer/webpack";

export function transformContent(content: React.ReactNode) {
  const React = webpack.common.React!;
  
  return React.Children.map(content, (child) => (
    <div className="vx-modals-content-line">
      {typeof child === "string" ? (
        <Markdown text={child} />
      ) : (
        <ErrorBoundary>
          {child}
        </ErrorBoundary>
      )}
    </div>
  ));
}