import { cache } from "renderer/util";
import webpack from "renderer/webpack";

const simpleMarkdown = cache(() => webpack.getModule<VX.modules.SimpleMarkdown>((m) => m.parse && m.defaultRules)!);

export function parse(text: string) {
  return simpleMarkdown().parse(text);
};

export function useMarkdown(text: string): React.ReactNode {
  return webpack.common.React!.useMemo(() => parse(text), [ text ]);
};

function Markdown({ text }: { text: string }) {
  const React = webpack.common.React!;
  const parsed = useMarkdown(text);

  return <>{parsed}</>;
};

export default Markdown;