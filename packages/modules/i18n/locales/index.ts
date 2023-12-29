import { LocaleCodes } from "../../../mod/src/webpack/common";
import enUS, { ALL_KNOWN_MESSAGES } from "./en-us";

const locales: Partial<Record<LocaleCodes, Partial<ALL_KNOWN_MESSAGES>>> = {
  "en-US": enUS
};

export function getMessage(message: keyof typeof enUS, locale: LocaleCodes) {
  const foundLocale = locale in locales ? locales[locale]! : locales["en-US"]!;
  
  if (message in foundLocale) return foundLocale[message];
  if (message in locales["en-US"]!) return  locales["en-US"]![message];
  return null;
}