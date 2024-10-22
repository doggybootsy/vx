import { ModalComponents } from ".";
import { openModal } from "./actions";
import { CodeBlock, CodeBlockProps, Flex } from "../../components";

export function openCodeModal(options: Omit<CodeBlockProps, "canOpenInModal">) {
  return openModal((props) => (
    <ModalComponents.Root 
      transitionState={props.transitionState} 
      size={ModalComponents.Size.DYNAMIC}
      className="vx-codeblock-modal"
    >
      <CodeBlock
        {...options}
        canOpenInModal={false}
      />
    </ModalComponents.Root>
  ));
};