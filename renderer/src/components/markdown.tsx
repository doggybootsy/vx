import { cache } from "renderer/util";
import webpack from "renderer/webpack";

const simpleMarkdown = cache(() => webpack.getModule<VX.modules.SimpleMarkdown>((m) => m.parse && m.defaultRules)!);

export function parse(text: string, askPluginsToNotMatch: boolean = false): React.ReactElement[] {
  return simpleMarkdown().parse(text, {}, { vxShouldSkip: askPluginsToNotMatch });
};

export function useMarkdown(text: string, askPluginsToNotMatch: boolean = false): React.ReactElement[] {
  return webpack.common.React!.useMemo(() => parse(text, askPluginsToNotMatch), [ text ]);
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