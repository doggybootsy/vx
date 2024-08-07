import { getLazyByProtoKeys } from "@webpack";
import { LocaleCodes } from "@webpack/common";

let FormatableMessageApi: any;
getLazyByProtoKeys([ "astFormat", "getContext" ], { searchExports: true }).then(api => FormatableMessageApi = api);

export class FormattedMessage {
  constructor(message: string, locale: LocaleCodes, hasMarkdown: boolean) {
    this.message = message;
    this.hasMarkdown = hasMarkdown;
    this.#locale = locale;
  }

  #locale: string;
  #formattedMessage?: FormattedMessage;
  #ensure() {
    if (!FormatableMessageApi) return;
    this.#formattedMessage = new FormatableMessageApi(this.message, this.#locale, this.hasMarkdown);
    return this.#formattedMessage!;
  }

  message: string;
  hasMarkdown: boolean;
  intlMessage: any;

  format<T extends string | React.ReactNode | string[] | React.ReactNode[]>(formatters: Record<string, any>): T {
    return (this.#ensure() ? this.#formattedMessage!.format(formatters) : this.message) as T;
  }

  // Fallback
  toString(): string {
    return this.message;
  }
}