import hljs, { Language } from "highlight.js";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Icons, Scroller, Tooltip } from "../../components";
import { className, clipboard, convertSvgToURL, download, getCSSVarColor } from "../../util";
import { Messages } from "vx:i18n";
import { IconFullProps } from "../../components/icons";
import { useDestructor, useForceUpdate } from "../../hooks";
import {openCodeModal, openImageModal} from "../../api/modals";

function HeaderButton({ icon: Icon, text, onClick }: { icon: React.ComponentType<IconFullProps>, text: string, onClick(event: React.MouseEvent<HTMLDivElement>): void }) {
  return (
    <Tooltip text={text} hideOnClick={false}>
      {(props) => (
        <div {...props} onClick={(event) => { props.onClick(); onClick(event); }} className="vx-bcb-action">
          <Icon />
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
          cn: className([ "vx-cbc-row", `vx-cbc-${match[1]}` ]),
          html: match[2]
        }
      }
    }
    
    return {
      cn: "vx-cbc-row",
      html: code
    };
  }, [ hasDiff, code ]);

  return (
    <tr className={cn}>
      <td className="vx-cbc-index">{index + 1}</td>
      <td dangerouslySetInnerHTML={{ __html: html }} className="vx-cbc-line" />
    </tr>
  )
}

const DIFF_CODE_TYPE = /^diff([-~])/;

export function CodeBlock({ lang, content }: { lang: string, content: string }) {
  const isDiffAnd = useMemo(() => DIFF_CODE_TYPE.test(lang.toLowerCase()), [lang]);

  // @ts-ignore
  const [language, languageDefinition] = useMemo<[string, Language]>(() => {
    const $lang = isDiffAnd ? lang.slice(5) : lang;
    const language = hljs.getLanguage($lang) || hljs.getLanguage("txt");
    return [$lang, language];
  }, [lang, isDiffAnd]);

  const formattedContent = useMemo(() => {
    const languageName = languageDefinition?.name?.toLowerCase();
    return languageName === 'json' || languageName === 'plain text' && content
        ? (() => {
          try {
            return JSON.stringify(JSON.parse(content), null, 2);
          } catch {
            return content;
          }
        })()
        : content;
  }, [content, languageDefinition]);
  
  const effectiveLanguage = useMemo(() => {
    try {
      JSON.parse(content);
      return "json";
    } catch {
      return language;
    }
  }, [content, language]);

  const highlight = useMemo(() => {
    if (isDiffAnd) {
      const diff = hljs.highlight(content, { language: "diff" });
      const result = hljs.highlight(formattedContent, { language: effectiveLanguage });

      const diffSplit = diff.value.split("\n");
      const codeSplit = result.value.split("\n");

      const code: string[] = [];

      for (let index = 0; index < diffSplit.length; index++) {
        const match = diffSplit[index].match(DIFF_REGEX);
        if (match) {
          code.push(`<span class="hljs-${match[1]}">${codeSplit[index]}</span>`);
        } else {
          code.push(codeSplit[index]);
        }
      }

      return code;
    }

    return hljs.highlight(formattedContent, { language: effectiveLanguage }).value.split("\n");
  }, [formattedContent, effectiveLanguage, isDiffAnd]);

  const svgURL = useSVGUrl(content, languageDefinition);
  
  /*
  <HeaderButton
    text="Code Modal"
    icon={Icons.Code}
    onClick={(event) => openCodeModal({code: formattedContent, language: effectiveLanguage, filename: `codeblock.${effectiveLanguage}`})}
  /> This will be the code modals revenge arc cause of you doggy
   */
  
  return (
      <div className="vx-bcb" data-lang-name={effectiveLanguage} data-raw-lang={lang}>
        <div className="vx-bcb-header">
          <div className="vx-bcb-lang">
            {isDiffAnd ? `Diff & ${languageDefinition.name}` : languageDefinition.name}
          </div>
          <div className="vx-bcb-actions">
            {svgURL && (
                <HeaderButton
                    text="Preview"
                    icon={Icons.DiscordIcon.from("EyeIcon")}
                    onClick={(event) => openImageModal(svgURL, { scale: event.shiftKey ? 1 : 10 })}
                />
            )}
            {clipboard.SUPPORTS_COPY && (
                <HeaderButton
                    text={Messages.COPY}
                    icon={Icons.Copy}
                    onClick={() => clipboard.copy(content)}
                />
            )}
            <HeaderButton
                text={Messages.DOWNLOAD}
                icon={Icons.Download}
                onClick={() => download(`codeblock.${effectiveLanguage}`, formattedContent)}
            />
          </div>
        </div>
        <Scroller type="thin" fade className="vx-bcb-wrapper" overflow="scroll hidden">
          <table className="vx-bcb-body">
            <tbody>
            {highlight.map((value, index) => (
                <Line code={value} index={index} hasDiff={isDiffAnd} key={index} />
            ))}
            </tbody>
          </table>
        </Scroller>
      </div>
  );
}