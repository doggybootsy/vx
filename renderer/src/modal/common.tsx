import { ErrorBoundary } from "renderer/components";
import MarkDownParser from "renderer/ui/markdown";
import webpack from "renderer/webpack";

export function transformContent(content: React.ReactNode) {
  const React = webpack.common.React!;
  
  return React.Children.map(content, (child) => (
    <div className="vx-modals-content-line">
      {typeof child === "string" ? (
        <MarkDownParser text={child} />
      ) : (
        <ErrorBoundary>
          {child}
        </ErrorBoundary>
      )}
    </div>
  ));
}