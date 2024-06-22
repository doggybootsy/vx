import { Children, useMemo } from "react";

import { getProxyByKeys } from "@webpack";
import ErrorBoundary from "./boundary";

const markdownWrapper = getProxyByKeys<{
  parse(text: string, state?: Record<PropertyKey, any>): React.ReactNode
}>([ "parse", "defaultRules", "parseTopic" ]);

export function Markdown(props: { text: string, state?: Record<PropertyKey, any> }) {
  const parsed = useMemo(() => {
    return markdownWrapper.parse(props.text, props.state);
  }, [ props.text, props.state ]);

  return <>{parsed}</>;
}

export function transformContent(content: React.ReactNode | React.ReactNode[], lineClassName: string) {
  return Children.map(content, (child) => {
    if (typeof child === "string") return (
      <div className={lineClassName}>
        <Markdown text={child} />
      </div>
    )
    
    return (
      <div className={lineClassName}>
        <ErrorBoundary>
          {child}
        </ErrorBoundary>
      </div>
    )
  });
}