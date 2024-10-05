// MarkdownRenderer.tsx
import React, { useEffect, useRef } from 'react';
import { Parser, HtmlRenderer } from 'commonmark';
import hljs from "highlight.js";

const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const parseMarkdown = (markdown: string): string => {
        const parser = new Parser();
        const ast = parser.parse(markdown);
        const renderer = new HtmlRenderer();
        return renderer.render(ast);
    };

    // Parse the Markdown to HTML
    const htmlOutput = parseMarkdown(markdown);

    useEffect(() => {
        if (containerRef.current) {
            const codeBlocks = containerRef.current.querySelectorAll('pre code');
            codeBlocks.forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        }
    }, [htmlOutput]);

    return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: htmlOutput }} />;
};

export default MarkdownRenderer;
