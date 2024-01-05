import { I18n, LocaleCodes } from "@webpack/common";

const META_REGEX = /^\/\*\*([\s\S]+?)\*\//;
const META_TAG_REGEX = /\*\s*@(?<key>\w+)(?::(?<lang>(\w|-)+))?\s+(?<body>.+)/g;

type SupportsI18n = "version_name" | "description" | "name";
interface I18nSupportedValue {
  default: string | null, 
  i18n: Partial<Record<Lowercase<LocaleCodes>, string>>
};
type AuthorValue = { username: string, discord?: string }[];

const supportsI18nKeys = new Set([
  "version_name", "description", "name"
]);


export type Meta = Record<string, string> & Partial<Record<SupportsI18n, I18nSupportedValue>> & { authors?: AuthorValue };

export function getMetaProperty(meta: Meta, key: keyof Meta, defaultValue: string) {
  const value = meta[key] as I18nSupportedValue | string;

  if (!value) return defaultValue;
  if (typeof value === "string") {
    return value as string;
  }

  const locale = I18n.getLocale().toLowerCase() as Lowercase<LocaleCodes>;
  if (locale in value.i18n) return value.i18n[locale]!;
  return value.default ?? defaultValue;
};

export function getMetaUsagePropertyKey(meta: Meta, key: SupportsI18n) {
  const value = meta[key];

  if (!value) return null;

  const locale = I18n.getLocale().toLowerCase() as Lowercase<LocaleCodes>;
  if (locale in value.i18n) return locale;
  if (typeof value.default === "string") return "default";
  return null;
};

export function replaceMetaValue(meta: Meta, key: string, value: string | AuthorValue) {
  const clone = structuredClone(meta);

  key = key.replace(/-/g, "_");

  if (supportsI18nKeys.has(key)) {
    const cValue = clone[key as SupportsI18n] ??= { default: null, i18n: {} };

    const i18nKey = !cValue ? "default" : getMetaUsagePropertyKey(meta, key as SupportsI18n);

    if (!i18nKey || i18nKey === "default") {
      cValue.default = value as string;
    }
    else {
      cValue.i18n[i18nKey] = value as string;
    }
  }
  else if (key === "authors") {
    clone.authors = value as AuthorValue;
  }
  else {
    meta[key] = value as string;
  };

  return clone;
};

export function getMeta(code: string): Meta {
  const metaBlock = code.match(META_REGEX);
  if (!metaBlock) return {};

  const meta: Meta = {};
  const matches = metaBlock[1].matchAll(META_TAG_REGEX);

  const usernames = [];
  const uids = [];

  for (const match of matches) {
    let { key, lang, body } = match.groups!;

    body = body.trimEnd();

    key = key.toLowerCase();
    if (typeof lang === "string") lang = lang.toLowerCase();

    if (supportsI18nKeys.has(key)) {
      const data = meta[key as SupportsI18n] ??= { default: null, i18n: {} };

      if (typeof lang === "string") {
        data.i18n[lang as Lowercase<LocaleCodes>] = body;
      }
      else {
        data.default = body;
      }

      continue;
    }
    if (key === "author" || key === "authorid") {
      if (key === "author") usernames.push(body);
      else uids.push(body);
      
      continue;
    }

    meta[key] = body;
  };

  const authors = [];

  for (const key in usernames) {
    if (Object.prototype.hasOwnProperty.call(usernames, key)) {
      const username = usernames[key];
      const id = uids[key];

      const author: { username: string, discord?: string } = { username };
      if (typeof id === "string") {
        author.discord = id;
      }

      authors.push(author);
    }
  }

  return Object.assign({ authors }, meta);
};

function stringify(meta: Meta) {
  const chunks = [];

  for (const key in meta) {
    if (Object.prototype.hasOwnProperty.call(meta, key)) {
      const value = meta[key] as unknown as string | I18nSupportedValue | AuthorValue;
      
      if (typeof value === "string") {
        chunks.push(` * @${key} ${value}`);
      }
      else if (Array.isArray(value)) {
        for (const { username, discord } of value) {
          chunks.push(` * @author ${username}`);
          if (typeof discord === "string") chunks.push(` * @authorId ${discord}`);
        }
      }
      else {
        if (typeof value.default === "string") chunks.push(` * @${key} ${value.default}`);
        for (const lang in value.i18n) {
          if (Object.prototype.hasOwnProperty.call(value.i18n, lang)) {
            const element = value.i18n[lang as Lowercase<LocaleCodes>];
            chunks.push(` * @${key}:${lang} ${element}`);
          }
        }
      }
    }
  }

  return `/**\n${chunks.join("\n")}\n */`;
};

export function replaceMeta(code: string, newMeta: Meta) {
  const meta = stringify(newMeta);

  const match = code.match(META_REGEX);

  if (!match) {
    return `${meta}\n${code}`;
  };

  return `${meta}${code.substring(match[0].length)}`
};
