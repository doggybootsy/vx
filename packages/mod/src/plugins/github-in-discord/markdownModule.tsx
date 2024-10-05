// MarkdownRenderer.tsx
import { useMemo } from "react";
import { Parser, HtmlRenderer, Node } from "commonmark";
import hljs from "highlight.js";

// Attempt to add classes to all nodes

const parser = new Parser();
const renderer = new HtmlRenderer();

// @ts-expect-error
renderer.attrs = function(node: Node) {
  // @ts-expect-error
  const res: Record<string, string> = Object.fromEntries(HtmlRenderer.prototype.attrs.call(this, node));

  if (res.class) res.class = `${res.class} vx-gm-markdown-${node.type.replace(/_/g, "-")}`;
  else res.class = `vx-gm-markdown-${node.type.replace(/_/g, "-")}`;

  return Object.entries(res);
}

// @ts-expect-error
renderer.code_block = function(this: HtmlRenderer & Record<string, any>, node: Node) {
  let language = node.info && hljs.getLanguage(node.info) ? node.info : "txt";
  
  let attributes = [ ...this.attrs(node), [ "class", `vx-gm-markdown-code-block ${language}` ] ];

  this.cr();
  this.tag("pre");
  this.tag("code", attributes);
  this.lit(hljs.highlight(node.literal!, { language }).value);
  this.tag("/code");
  this.tag("/pre");
  this.cr();
};

const reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
const reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

// @ts-expect-error
renderer.image = function(this: HtmlRenderer & Record<string, any>, node: Node, entering: boolean) {
    if (entering) {
      if (this.disableTags === 0) {
        if (this.options.safe && (reUnsafeProtocol.test(node.destination!) && !reSafeDataProtocol.test(node.destination!))) {
          this.lit('<img src="" alt="');
        } else {
          this.lit('<img src="' + this.esc(node.destination) + '" alt="');
        }
      }
      this.disableTags += 1;
    } else {
      this.disableTags -= 1;
      if (this.disableTags === 0) {
        if (node.title) {
          this.lit('" title="' + this.esc(node.title));
        }
        this.lit('" style="max-width: 100%;" class="vx-gm-markdown-image');
        this.lit('" />');
      }
    }
};

const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {    
  const html = useMemo(() => {
    return (
      renderer.render(parser.parse(markdown))
    );
  }, [ markdown ])    

  return <div className="vx-gm-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MarkdownRenderer;
