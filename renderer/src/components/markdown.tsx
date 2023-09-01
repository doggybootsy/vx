import webpack from "renderer/webpack";
import { parse } from "renderer/markdown";

export function useMarkdown(text: string, askPluginsToNotMatch: boolean = false): React.ReactElement[] {
  return webpack.common.React!.useMemo(() => parse(text, { vxShouldSkip: askPluginsToNotMatch })!, [ text ]);
};

function Markdown({ text, askPluginsToNotMatch = false }: { text: string, askPluginsToNotMatch?: boolean }): React.ReactElement {
  const React = webpack.common.React!;
  const parsed = useMarkdown(text, askPluginsToNotMatch);

  return (
    <>
      {parsed}
    </>
  );
};

export default Markdown;