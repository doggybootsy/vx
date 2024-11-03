import { LocaleCodes } from "@webpack/common";
import { internalDataStore } from "../../mod/src/api/storage";
import { getMessage } from "./locales";
import { FormattedMessage } from "./locales/formattedMessage";
import { ALL_KNOWN_MESSAGES } from "./locales/en-us";
import { KeysMatching } from "typings";
import { DiscordFormattedMessage, intlModule } from "./intl";

export { FormattedMessage };

export { onLocaleChange, onI18nLoaded, convertStringToHash } from "./intl";

export function getLoadPromise(): Promise<void> {
  return new Promise((resolve) => resolve());
}

export function getLocale(): LocaleCodes {
  if (intlModule) return intlModule.intl.currentLocale;
  return internalDataStore.get("last-loaded-locale") ?? "en-US";
}

type KnownFormmatableStrings = "REPLYING_TO" | "NUM_IMAGES" | "NUM_ATTACHMENTS" | "NUM_USERS" | "CONNECTIONS_PROFILE_TIKTOK_LIKES" | KeysMatching<ALL_KNOWN_MESSAGES, FormattedMessage>;
type KnownStrings = "DOWNLOAD" | "EDIT" | "DELETE" | "HELP" | KeysMatching<ALL_KNOWN_MESSAGES, string>;

type MessagesType = Omit<Record<Uppercase<string>, string>, KnownStrings | KnownFormmatableStrings> & Record<KnownStrings, string> & Record<KnownFormmatableStrings, FormattedMessage | DiscordFormattedMessage>;

export const Messages = new Proxy<MessagesType>({} as MessagesType, {
  get(target, p) {
    if (typeof p !== "string") throw new TypeError(`Can not get a property key with typeof '${typeof p}'`);
    let prop = p as Uppercase<string>;

    const message = getMessage(prop as any, getLocale());
    // Add to target for devtools
    if (message) return target[prop] = message as any;

    // @ts-expect-error
    const msg = (target[prop] ??= new DiscordFormattedMessage(prop, getLocale(), false)) as DiscordFormattedMessage;
    
    return msg.canBeFormatted() === "no" ? msg.toString() : msg;
  },
  set() { return false },
  deleteProperty() { return false },
  defineProperty() { return false }
});

export function getLocaleName(local: string) {
  local = local.slice(0, 2).toLowerCase() + local.slice(2).toUpperCase();
  
  // if (i18nModuleLoaded) return (I18n.Messages[local as Uppercase<string>] || local).split(",")[0];
  return local;
}
