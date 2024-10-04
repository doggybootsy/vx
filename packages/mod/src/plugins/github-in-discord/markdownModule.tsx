/*
import React from 'react';
import {Markdown} from "../../components";

// Function to parse markdown
const parseMarkdown = (markdown) => {
    const lines = markdown?.split('\n') ?? "# This is awkward...\n**There was empty text**, Excuse me while I take a second to rethink what happened.\n\n".split('\n');
    const parsedLines = lines.map((line, index) => {

        if (/@\w+/.test(line)) {
            const parts = line.split(/(@\w+)/g);
            return (
                <Markdown texclassName="vx-markdown-paragraph" key={index}>
                    {parts.map((part, i) =>
                        /@\w+/.test(part)
                            ? <>{part.toLowerCase()}</>
                            : part
                    )}
                </Markdown>
            );
        }
        
        if (line.startsWith('### ')) {
            return <h3 className="vx-markdown-header vx-markdown-header-3" key={index}>{line.slice(4)}</h3>;
        } else if (line.startsWith('## ')) {
            return <h2 className="vx-markdown-header vx-markdown-header-2" key={index}>{line.slice(3)}</h2>;
        } else if (line.startsWith('# ')) {
            return <h1 className="vx-markdown-header vx-markdown-header-1" key={index}>{line.slice(2)}</h1>;
        }
        else if (line.startsWith('> ')) {
            return <blockquote className="vx-markdown-blockquote" key={index}>{line.slice(2)}</blockquote>;
        }
        else if (line.startsWith('~')) {
            return <span className="vx-markdown-strikethrough" key={index}>{line.slice(1)}</span>;
        }
        else if (line.startsWith('```')) {
            // const language = line.slice(3).trim();
            return <pre className="vx-markdown-code-block" key={index}>{line}</pre>;
        }
        else if (line.startsWith('@')) {
            // const language = line.slice(3).trim();
            return <Markdown text={`<${line.toLowerCase()}>`} key={index}/>;
        }
        else if (line.includes('`')) {
            const parts = line.split(/(`[^`]+`)/g);
            return (
                <p className="vx-markdown-paragraph" key={index}>
                    {parts.map((part, i) =>
                        part.startsWith('`') && part.endsWith('`')
                            ? <code className="vx-markdown-inline-code" key={i}>{part.slice(1, -1)}</code>
                            : part
                    )}
                </p>
            );
        }
        else if (line.includes('**') || line.includes('*')) {
            const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
            return (
                <p className="vx-markdown-paragraph" key={index}>
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong className="vx-markdown-strong" key={i}>{part.slice(2, -2)}</strong>;
                        } else if (part.startsWith('*') && part.endsWith('*')) {
                            return <em className="vx-markdown-em" key={i}>{part.slice(1, -1)}</em>;
                        }
                        return part;
                    })}
                </p>
            );
        }
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
                <ul className="vx-markdown-list" key={index}>
                    <li>{line.slice(2)}</li>
                </ul>
            );
        } else if (/^\d+\.\s/.test(line)) {
            return (
                <ol className="vx-markdown-ordered-list" key={index}>
                    <li>{line.slice(line.indexOf('.') + 1).trim()}</li>
                </ol>
            );
        }
        else if (line.startsWith('![')) {
            const altText = line.split('[')[1]?.split(']')[0];
            const src = line.split('(')[1]?.split(')')[0];
            return <img key={index} alt={altText} src={src} className="vx-markdown-image" />;
        }
        else if (line.startsWith('[')) {
            const text = line.split('[')[1]?.split(']')[0];
            const href = line.split('(')[1]?.split(')')[0];
            return <a key={index} href={href} className="vx-markdown-link">{text}</a>;
        }
        return <p className="vx-markdown-paragraph" key={index}>{line}</p>;
    });

    return parsedLines;
};

export const MarkdownParser = ({ markdownText }) => {
    return <div>{parseMarkdown(markdownText)}</div>;
};

 */

// Scrapped for now. Do keep tho due to I will come back to it.