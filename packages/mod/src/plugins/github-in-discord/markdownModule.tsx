// MarkdownRenderer.tsx
import React, {useEffect} from 'react';
import { Parser, HtmlRenderer } from 'commonmark';
import hljs from "../../fake_node_modules/highlight.js";

const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
    const parseMarkdown = (markdown: string): string => {
        const parser = new Parser();
        const ast = parser.parse(markdown);
        const renderer = new HtmlRenderer();
        return renderer.render(ast);
    };

    // Parse the Markdown to HTML
    const htmlOutput = parseMarkdown(markdown);

    useEffect(() => {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, [htmlOutput]);

    return <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />;
};

export default MarkdownRenderer;
