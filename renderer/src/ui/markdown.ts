import { cache } from "renderer/util";
import webpack from "renderer/webpack";

const markDownParser = cache(() => webpack.getModule<{ parse(content: string): React.ReactNode }>((m) => m.defaultRules && m.parse)!);

function MarkDownParser({ text }: { text: string }) {
  const React = webpack.common.React!;

  const returnElement = React.useMemo(() => markDownParser.getter.parse(text), [ text ]);

  return returnElement;
};

export default MarkDownParser;