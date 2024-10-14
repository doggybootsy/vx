import hljs, { Language } from "highlight.js";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Icons, Scroller, Tooltip } from ".";
import { className, clipboard, convertSvgToURL, download } from "../util";
import { Messages } from "vx:i18n";
import { IconFullProps } from "./icons";
import { useDestructor, useForceUpdate } from "../hooks";
import { ModalComponents, openCodeModal, openImageModal, openModal } from "../api/modals";

import "./codeblock.css";

function HeaderButton({ icon: Icon, text, action: onClick }: CodeBlockButton) {
  return (
    <Tooltip text={text} hideOnClick={false}>
      {(props) => (
        <div 
          {...props} 
          onClick={(event) => { 
            props.onClick(); 
            onClick(event); 
          }} 
          className="vx-codeblock-action"
        >
          <Icon height={22} width={22} />
        </div>
      )}
    </Tooltip>
  )
}

function useSVGUrl(code: string, language: Language) {
  const url = useRef<undefined | string>();

  const [, forceUpdate ] = useForceUpdate();

  useDestructor(() => url.current && URL.revokeObjectURL(url.current), [ ]);

  useLayoutEffect(() => {
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = undefined;
    
    if (language.name === "HTML, XML") url.current = convertSvgToURL(code);

    forceUpdate();
  }, [ code, language ]);

  return url.current;
}

const DIFF_REGEX = /^<span class="hljs-(addition|deletion)">(.+)<\/span>$/;

function Line({ code, index, hasDiff }: { code: string, index: number, hasDiff: boolean }) {
  const { cn, html } = useMemo(() => {
    if (hasDiff) {
      const match = code.match(DIFF_REGEX);
      if (match) {
        return {
          cn: className([ "vx-codeblock-row", `vx-codeblock-${match[1]}` ]),
          html: match[2]
        }
      }
    }
    
    return {
      cn: "vx-codeblock-row",
      html: code
    };
  }, [ hasDiff, code ]);

  return (
    <tr className={cn}>
      <td className="vx-codeblock-index">{index + 1}</td>
      <td dangerouslySetInnerHTML={{ __html: html }} className="vx-codeblock-line" />
    </tr>
  )
}

const DIFF_CODE_TYPE = /^(?:diff|patch)[-~]/i;

export interface CodeBlockProps {
  language: string,
  content: string,
  title?: string,
  canOpenInModal?: boolean,
  buttons?: React.ReactNode,
  className?: string
}

interface CodeBlockButton {
  text: string,
  icon: React.ComponentType<IconFullProps>,
  action(event: React.MouseEvent<HTMLDivElement>): void
}

export function CodeBlock({ className: cn, language: lang, content, title, canOpenInModal, buttons }: CodeBlockProps) {
  const isDiffAnd = useMemo(() => DIFF_CODE_TYPE.test(lang), [ lang ]);
  
  const [ language, languageDefinition, pContent ] = useMemo<[ string, Language, string ]>(() => {
    const $lang = isDiffAnd ? lang.slice(5) : lang;
    const language = hljs.getLanguage($lang);

    if (!language) return [
      "txt", hljs.getLanguage("txt")!, content
    ];

    if (language.name === "Plain Text" || language.name === "JSON") {
      try {
        const code = JSON.stringify(JSON.parse(content), null, "\t");
        return [
          "json",
          hljs.getLanguage("json")!,
          code
        ];
      } 
      catch (error) {
        
      }
    }

    return [ $lang, language, content ];
  }, [ lang, isDiffAnd, content ]);

  const highlight = useMemo(() => {
    if (isDiffAnd) {
      const diff = hljs.highlight(content, { language: "diff" });
      const result = hljs.highlight(pContent.replace(/^[\+-]/gm, ""), { language });

      const diffSplit = diff.value.split("\n");
      const codeSplit = result.value.split("\n");

      const code: string[] = [];
      
      for (let index = 0; index < diffSplit.length; index++) {
        const match = diffSplit[index].match(DIFF_REGEX);
        if (match) {
          const sign = match[1] === "addition" ? "+" : "-";

          code.push(`<span class="hljs-${match[1]}">${sign}${codeSplit[index]}</span>`);
        } else {
          code.push(codeSplit[index]);
        }
      }

      return code;
    }

    return hljs.highlight(pContent, { language }).value.split("\n");
  }, [ pContent, language, isDiffAnd ]);

  const svgURL = useSVGUrl(content, languageDefinition);
  
  const hasDiff = useMemo(() => isDiffAnd || (languageDefinition.name === "Diff"), [ isDiffAnd, languageDefinition ]);

  return (
    <div className={className([ "vx-codeblock", cn ])} data-lang-name={languageDefinition.name} data-raw-lang={lang}>
      <div className="vx-codeblock-header">
        {canOpenInModal && (
          <Tooltip text="Open in modal">
            {(props) => (
              <div 
                className="vx-codeblock-inlarge" 
                {...props}
                onClick={() => {
                  props.onClick();
                  openCodeModal({ language: lang, content, buttons, title });
                }}
              >
                <Icons.DiscordIcon name="MaximizeIcon" size={16} />
              </div>
            )}
          </Tooltip>
        )}
        <div className="vx-codeblock-lang">
          {title ? title : isDiffAnd ? `Diff & ${languageDefinition.name}` : languageDefinition.name}
        </div>
        <div className="vx-codeblock-actions">
          {Array.isArray(buttons) && buttons.map((props, index) => (
            <HeaderButton {...props} key={index} />
          ))}
          {svgURL && (
            <HeaderButton
              text="Preview"
              icon={Icons.DiscordIcon.from("EyeIcon")}
              action={(event) => openImageModal(svgURL, { scale: event.shiftKey ? 1 : 10 })}
            />
          )}
          {clipboard.SUPPORTS_COPY && (
            <HeaderButton
              text={Messages.COPY}
              icon={Icons.Copy}
              action={() => clipboard.copy(content)}
            />
          )}
          <HeaderButton
            text={Messages.DOWNLOAD}
            icon={Icons.Download}
            action={() => download(`${Date.now()}.${language}`, pContent)}
          />
        </div>
      </div>
      <Scroller type="thin" fade className="vx-codeblock-wrapper" overflow="scroll hidden">
        <table className="vx-codeblock-body">
          <tbody>
            {highlight.map((value, index) => (
              <Line code={value} index={index} hasDiff={hasDiff} key={index} />
            ))}
          </tbody>
        </table>
      </Scroller>
    </div>
  );
}