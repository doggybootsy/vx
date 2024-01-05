import { getLazyByKeys } from "@webpack";
import { LocaleCodes } from "@webpack/common";

let FormatableMessageApi: any;
getLazyByKeys([ "FormattedMessage" ]).then(api => FormatableMessageApi = api);

export class FormattedMessage {
  constructor(message: string, locale: LocaleCodes, hasMarkdown: boolean) {
    this.message = hasMarkdown ? message : message.replace(/!!/g, "");
    this.hasMarkdown = hasMarkdown;
    this.#locale = locale;
  };

  #locale: string;
  #formattedMessage?: FormattedMessage;
  #ensure() {
    if (!FormatableMessageApi) return;
    this.#formattedMessage = new FormatableMessageApi.FormattedMessage(this.message, this.#locale, this.hasMarkdown);
    return this.#formattedMessage!;
  };

  message: string;
  hasMarkdown: boolean;
  intlMessage: any;

  format(formatters: Record<string, any>): string | React.ReactNode[] {
    return this.#ensure() ? this.#formattedMessage!.format(formatters) : this.message;
  }
};