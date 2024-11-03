import { useRef, useState } from "react";

import { Button, SystemDesign } from "../../components";
import { openModal } from "./actions";
import { ConfirmModalOptions } from "./confirmModal";
import { Messages } from "vx:i18n";

type PromptOptions = {
  minLength?: number,
  maxLength?: number,
  value?: string,
  placeholder?: string,
  validate?: ((text: string) => boolean) | RegExp
};
type PromptModalOptions = Omit<ConfirmModalOptions, "onCloseRequest" | "onConfirm" | "onCancel"> & PromptOptions;

export function openPromptModal(title: React.ReactNode, options: PromptModalOptions = { }): Promise<string | null> {
  let input = options.value ?? "";
  const minLength = options.minLength ?? 0;
  const maxLength = options.maxLength ?? 999;
  const validate = options.validate ? options.validate instanceof RegExp ? (text: string) => (options.validate as RegExp).test(text) : options.validate : () => true;

  function dummy() { };
  const {
    confirmText = Messages.OKAY,
    cancelText = Messages.CANCEL,
    onCloseCallback = dummy,
    danger = false
  } = options;

  function isInputOk() {
    if (!validate(input)) return false;
    if (input.length < minLength) return false;
    if (input.length > maxLength) return false;
    return true;
  }
    
  return new Promise((resolve) => {
    const modal = openModal((props) => {
      const ref = useRef<{ shake(): void }>();
      const [ state, setState ] = useState(input);
      const [ hasError, setHasError ] = useState(() => !isInputOk());
      
      return (
        <SystemDesign.Shakeable
          ref={ref}
        >
          <SystemDesign.ConfirmModal
            header={title}
            className="vx-modals-confirm-modal"
            confirmText={confirmText}
            onConfirm={() => {
              if (!isInputOk()) {
                if (!ref.current) return;
                ref.current.shake();
                return;
              }
              
              resolve(input);
              modal.close();
            }}
            cancelText={cancelText}
            onCancel={() => {
              resolve(null);
              modal.close();
            }}
            confirmButtonColor={danger ? Button.Colors.RED : Button.Colors.BRAND}
            transitionState={props.transitionState}
            onClose={() => {}}
          >
            <SystemDesign.TextInput 
              value={state}
              placeholder={options.placeholder}
              style={{
                borderStyle: "solid",
                borderWidth: 1
              }}
              error={hasError ? options.validate instanceof RegExp ? `Input doesn't match expression '${options.validate}'` : "Input doesn't match validator" : undefined}
              onChange={(value: string) => {                
                setState(value);
                input = value;
              
                setHasError(!isInputOk());
              }}
              onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.code.toLowerCase() === "enter") {
                  if (!isInputOk()) {
                    if (!ref.current) return;
                    ref.current.shake();
                    return;
                  };
                  resolve(input);
                  modal.close();
                };
              }}
              minLength={minLength}
              maxLength={maxLength}
              autoFocus
            />
          </SystemDesign.ConfirmModal>
        </SystemDesign.Shakeable>
      )
    }, {
      onCloseCallback,
      onCloseRequest() { return false; }
    });
  });
}