import { getLazyByKeys } from "@webpack";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { ErrorBoundary, CodeBlock } from "../../components";

const injector = new Injector();

interface SimpleMarkdown {
  defaultRules: {
    codeBlock: {
      react(node: MarkdownNode, renderChildren: Function, opts: MarkdownOptions): React.ReactNode
    }
  }
}
interface MarkdownNode {
  content: string,
  inQuote: boolean,
  lang: string
}
interface MarkdownOptions {
  key: string
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  injector,
  async start(signal) {
    const SimpleMarkdownWrapper = await getLazyByKeys<SimpleMarkdown>([ "defaultRules", "parse" ], { signal });

    injector.after(SimpleMarkdownWrapper.defaultRules.codeBlock, "react", (that, [ node,, opts ], res) => {
      return injector.return(
        <ErrorBoundary fallback={res} key={opts.key}>
          <CodeBlock language={node.lang} content={node.content} canOpenInModal />
        </ErrorBoundary>
      )
    });
  }
});