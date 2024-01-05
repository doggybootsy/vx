import { useRef, useState } from "react";

import { Button, MegaModule } from "../../components";
import { getProxyByKeys } from "@webpack";
import { I18n } from "@webpack/common";
import { openModal } from "./actions";
import { ConfirmModalOptions } from "./confirmModal";

type PromptOptions = {
  minLength?: number,
  maxLength?: number,
  value?: string,
  match?: RegExp,
  placeholder?: string
};
type PromptModalOptions = Omit<ConfirmModalOptions, "onCloseRequest" | "onConfirm" | "onCancel"> & PromptOptions;

export function openPromptModal(title: React.ReactNode, options: PromptModalOptions = { }): Promise<string | null> {
  let input = options.value ?? "";
  const minLength = options.minLength ?? 0;
  const maxLength = options.maxLength ?? 999;
  const match = options.match ?? /(?:)/;

  function dummy() { };
  const {
    confirmText = I18n.Messages.OKAY,
    cancelText = I18n.Messages.CANCEL,
    onCloseCallback = dummy,
    danger = false
  } = options;

  function isInputOk() {
    if (!match.test(input)) return false;
    if (input.length < minLength) return false;
    if (input.length > maxLength) return false;
    return true;
  };
    
  return new Promise((resolve) => {
    const modal = openModal((props) => {
      const ref = useRef<{ shake(): void }>();
      const [ state, setState ] = useState(input);
      const [ hasError, setHasError ] = useState(() => !match.test(input));
      
      return (
        <MegaModule.Shakeable
          ref={ref}
        >
          <MegaModule.ConfirmModal
            header={title}
            className="vx-modals-confirm-modal"
            confirmText={confirmText}
            onConfirm={() => {
              if (!isInputOk()) {
                if (!ref.current) return;
                ref.current.shake();
                return;
              };
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
            <MegaModule.TextInput 
              value={state}
              placeholder={options.placeholder}
              style={{
                borderStyle: "solid",
                borderWidth: 1
              }}
              error={hasError ? `Input doesn't match expression '${match}'` : undefined}
              onChange={(value: string) => {                
                setState(value);
                input = value;
              
                if (!match.test(value)) setHasError(true);
                else setHasError(false);
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
          </MegaModule.ConfirmModal>
        </MegaModule.Shakeable>
      )
    }, {
      onCloseCallback,
      onCloseRequest() { return false; }
    });
  });
};