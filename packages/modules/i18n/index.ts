import { getLazy } from "@webpack";
import { I18n, LocaleCodes } from "@webpack/common";
import { internalDataStore } from "../../mod/src/api/storage";
import { getMessage } from "./locales";
import { FormattedMessage } from "./locales/formattedMessage";
import { ALL_KNOWN_MESSAGES } from "./locales/en-us";
import { KeysMatching } from "typings";

export let i18nModuleLoaded = false;

const onI18nListeners = new Set<() => void>();
getLazy<typeof I18n>(m => m.Messages && Array.isArray(m._events.locale)).then(() => {
  i18nModuleLoaded = true;

  for (const listener of onI18nListeners) {
    listener();
  }
  onI18nListeners.clear();

  internalDataStore.set("last-loaded-locale", I18n.getLocale());
});

export function getLoadPromise(): Promise<void> {
  if (i18nModuleLoaded) return I18n.loadPromise;
  return new Promise((resolve) => {
    onI18nLoaded(() => {
      resolve(I18n.loadPromise);
    });
  });
}

export function onI18nLoaded(listener: () => void) {
  onI18nListeners.add(listener);
  return () => void onI18nListeners.delete(listener);
}

export function onLocaleChange(listener: (newLocale: LocaleCodes, oldLocale: LocaleCodes) => void) {
  if (!i18nModuleLoaded) {
    let undo = () => void onI18nListeners.delete(onI18n);

    function onI18n() {
      undo = onLocaleChange(listener);
    };

    onI18nListeners.add(onI18n);
    return () => undo();
  }

  I18n.on("locale", listener);
  return () => void I18n.off("locale", listener);
}

onLocaleChange((newLocale) => {
  internalDataStore.set("last-loaded-locale", newLocale);
});

export function getLocale(): LocaleCodes {
  if (i18nModuleLoaded) return I18n.getLocale();
  return internalDataStore.get("last-loaded-locale") ?? "en-US";
}

type KnownFormmatableStrings = KeysMatching<ALL_KNOWN_MESSAGES, FormattedMessage>;
type KnownStrings = "DOWNLOAD" | "EDIT" | "DELETE" | "HELP" | KeysMatching<ALL_KNOWN_MESSAGES, string>;

type MessagesType = Omit<Record<Uppercase<string>, string>, KnownStrings | KnownFormmatableStrings> & Record<KnownStrings, string> & Record<KnownFormmatableStrings, FormattedMessage>;

export const Messages = new Proxy<MessagesType>({} as MessagesType, {
  get(target, p) {
    if (typeof p !== "string") throw new TypeError(`Can not get a property key with typeof '${typeof p}'`);
    const prop = p.toUpperCase() as Uppercase<string>;

    const message = getMessage(prop as any, getLocale());
    // Add to target for devtools
    if (message) return target[prop] = message as any;

    return target[prop] = i18nModuleLoaded ? I18n.Messages[prop] || prop : prop;
  },
  set() { return false },
  deleteProperty() { return false },
  defineProperty() { return false }
});
