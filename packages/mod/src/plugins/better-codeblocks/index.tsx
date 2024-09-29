import { getLazyByKeys } from "@webpack";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { ErrorBoundary } from "../../components";
import { CodeBlock } from "./codeblock";
import * as styler from "./index.css?managed";

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
  styler,
  injector,
  async start(signal) {
    const SimpleMarkdownWrapper = await getLazyByKeys<SimpleMarkdown>([ "defaultRules", "parse" ], { signal });

    injector.after(SimpleMarkdownWrapper.defaultRules.codeBlock, "react", (that, [ node,, opts ], res) => {
      return injector.return(
        <ErrorBoundary fallback={res} key={opts.key}>
          <CodeBlock lang={node.lang} content={node.content} />
        </ErrorBoundary>
      )
    });
  }
});