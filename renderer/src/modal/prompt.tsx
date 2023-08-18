import VXError from "renderer/error";
import webpack from "renderer/webpack";
import { openConfirmModal, ConfirmModalOptions } from "renderer/modal/confirmModal";

type PromptOptions = {
  minLength?: number,
  maxLength?: number,
  value?: string,
  match?: RegExp,
  placeholder?: string
};
export type PromptModalOptions = Omit<ConfirmModalOptions, "onCloseRequest" | "onConfirm" | "onCancel"> & PromptOptions;

export function openPromptModal(title: React.ReactNode, options: PromptModalOptions = { }): Promise<string | null> {
  const React = webpack.common.React;
  if (!React) throw new VXError(VXError.codes.NO_REACT);
  const components = webpack.common.components;
  if (!components) throw new VXError(VXError.codes.NO_COMPONENTS);

  let input = options.value ?? "";
  const minLength = options.minLength ?? 0;
  const maxLength = options.maxLength ?? 999;
  const match = options.match ?? /(?:)/;

  function TextInput() {
    const TextInput = components!.TextInput;
    const [ state, setState ] = React!.useState(input);
    const [ hasError, setHasError ] = React!.useState(() => !match.test(input));    

    return (
      <TextInput 
        value={state}
        placeholder={options.placeholder}
        style={{
          borderStyle: "solid",
          borderWidth: 1
        }}
        error={hasError ? `Input doesn't match '${match}'` : undefined}
        onChange={(value: string) => {
          setState(value);
          input = value;

          if (!match.test(value)) setHasError(true);
          else setHasError(false);
        }}
        minLength={minLength}
        maxLength={maxLength}
      />
    );
  };

  function isInputOk() {
    if (!match.test(input)) return false;
    if (input.length < minLength) return false;
    if (input.length > maxLength) return false;
    return true;
  };

  return new Promise((resolve) => {
    const modal = openConfirmModal(title, [
      <TextInput />
    ], {
      ...options,
      onConfirm: () => isInputOk() && resolve(input),
      onCancel: () => {
        resolve(null);
        modal.close();
      },
      onCloseRequest: (closedFromButton) => {
        if (isInputOk() && closedFromButton) return true;
        return false;
      }
    })
  });
};
