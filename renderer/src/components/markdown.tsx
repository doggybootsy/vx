import webpack from "renderer/webpack";
import { parse } from "renderer/markdown";

export function useMarkdown(text: string, state = { }, askPluginsToNotMatch: boolean = false): React.ReactElement[] {
  return webpack.common.React!.useMemo(() => {
    return parse(text, {
      ...state, 
      vxShouldSkip: askPluginsToNotMatch 
    })!;
  }, [ text ]);
};

function Markdown({ text, state = { }, askPluginsToNotMatch = false }: { text: string, state?: object, askPluginsToNotMatch?: boolean }): React.ReactElement {
  const React = webpack.common.React!;
  const parsed = useMarkdown(text, state, askPluginsToNotMatch);

  return (
    <>
      {parsed}
    </>
  );
};

export default Markdown;