import { useEffect, useRef } from "react";
import { ModalComponents } from ".";
import { openModal } from "./actions";
import { Flex } from "../../components";
import { Editor } from "../../editor";
import { getProxyByKeys } from "../../webpack";

interface CodeModalOptions {
  code: string,
  language: string,
  filename: string
};

const hljs = getProxyByKeys([ "highlightAll", "listLanguages" ]);
function getLanguage(lang: string): string {  
  const language = hljs.getLanguage(lang);
  if (language && language.name) return language.name.toLowerCase();
  
  return lang;
};

export async function openCodeModal(options: CodeModalOptions) {
  return openModal((props) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!ref.current) return;

      new Editor(ref.current, getLanguage(options.language), options.code, { readonly: true });
    }, [ ]);

    return (
      <ModalComponents.ModalRoot
        size={ModalComponents.ModalSize.MEDIUM}
        transitionState={props.transitionState}
        className="vx-code-modal"
      >
        <ModalComponents.ModalHeader separator={false} justify={Flex.Justify.BETWEEN}>
          <div className="vx-modal-title">
            {options.filename}
          </div>
          <ModalComponents.ModalCloseButton onClick={props.onClose} />
        </ModalComponents.ModalHeader>
        <div ref={ref} className="vx-code-editor" />
      </ModalComponents.ModalRoot>
    )
  });
};