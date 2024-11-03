import { getLazyByKeys } from "@webpack";
import { FormattedMessage as $FormattedMessage } from "./locales/formattedMessage";
import { LocaleCodes } from "@webpack/common";
// @ts-expect-error
import { hash } from "@intrnl/xxhash64";
import { internalDataStore } from "../../mod/src/api/storage";

export let intlModule: any;

const onI18nListeners = new Set<() => void>();

export function onI18nLoaded(listener: () => void) {
  if (intlModule) {
    queueMicrotask(listener);
    return () => {};
  }

  onI18nListeners.add(listener);
  return () => void onI18nListeners.delete(listener);
}

export function onLocaleChange(listener: (newLocale: LocaleCodes) => void) {
  if (!intlModule) {
    let undo = () => void onI18nListeners.delete(onI18n);

    function onI18n() {
      undo = onLocaleChange(listener);
    }

    onI18nListeners.add(onI18n);
    return () => undo();
  }

  const undo = intlModule.intl.onLocaleChange(listener);
  
  return () => void undo();
}

onLocaleChange((newLocale) => {
  internalDataStore.set("last-loaded-locale", newLocale);
});

getLazyByKeys([ "intl", "t" ]).then((intl) => {
  intlModule = intl;
  
  internalDataStore.set("last-loaded-locale", intl.intl.currentLocale);

  for (const listener of onI18nListeners) {
    listener();
  }

  onI18nListeners.clear();
});

export const convertStringToHash = (() => {
  const BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
  
  const IS_BIG_ENDIAN = (() => {
    const array = new Uint8Array(4);
    const view = new Uint32Array(array.buffer);
    return !((view[0] = 1) & array[0]);
  })();
  
  function numberToBytes(number: number | bigint) {
    number = BigInt(number);
    const array = [];
    const byteCount = Math.ceil(Math.floor(Math.log2(Number(number)) + 1) / 8);

    for (let i = 0; i < byteCount; i++) {
      array.unshift(Number((number >> BigInt(8 * i)) & BigInt(255)));
    }

    const bytes = new Uint8Array(array);
    // Convert to big-endian if necessary
    return IS_BIG_ENDIAN ? bytes : bytes.reverse();
  }
  
  function runtimeHashMessageKey(key: string) {
    const bigint = hash(key, 0);
    const bytes = numberToBytes(bigint);

    return [
      BASE64_TABLE[bytes[0] >> 2],
      BASE64_TABLE[((bytes[0] & 0x03) << 4) | (bytes[1] >> 4)],
      BASE64_TABLE[((bytes[1] & 0x0f) << 2) | (bytes[2] >> 6)],
      BASE64_TABLE[bytes[2] & 0x3f],
      BASE64_TABLE[bytes[3] >> 2],
      BASE64_TABLE[((bytes[3] & 0x03) << 4) | (bytes[3] >> 4)],
    ].join("");
  }
  
  const cache: Record<string, string> = {};
  return function convertToHash(key: string) {
    return cache[key] ??= runtimeHashMessageKey(key);
  }
})();

export class DiscordFormattedMessage extends $FormattedMessage {
  constructor(key: string, locale: LocaleCodes, hasMarkdown: boolean) {
    super("", locale, hasMarkdown);

    this.#key = key;
  }

  #key: string;

  public get key() {
    if (!intlModule) return this.#key;
    if (typeof intlModule.t[this.#key] !== "function") this.#key = convertStringToHash(this.#key);
    return this.#key;
  }

  public canBeFormatted() {
    try {
      if (!intlModule) return "unknown";
      if (typeof intlModule.t[this.key]().ast !== "string") return "yes";
      return "no";
    } catch (error) {
      return "unknown";
    }
  }

  public format<T extends string | React.ReactNode | string[] | React.ReactNode[]>(formatters: Record<string, any>): T {
    if (!intlModule) return this.toString() as T;
    return intlModule.intl.format(intlModule.t[this.key], formatters);
  }

  public toString(): string {
    if (!intlModule) return this.#key;
    return intlModule.intl.string(intlModule.t[this.key]);
  }
}