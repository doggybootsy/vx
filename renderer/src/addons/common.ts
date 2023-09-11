import { AddonMeta } from "common";

const commentRegex = /\/\*\*([\s\S]*?)\*\//;
const tagRegex = /\s*@(\w+)\s+([\s\S]*?(?=(?:\s@\w+)|$))/g;

const jsDocLinkRegex = /\{@link\s+([^}|]+)(?:\|([^}]+))?\}/g;
function convertJSDocUrls(data: string) {
  return data.replace(jsDocLinkRegex, (match, linkText, linkUrl) => {
    return linkUrl ? linkUrl : linkText;
  });
};

// Remove the white space and *
function trim(text: string) {
  const trimmed = text.replace(/\s+\*$/, "");
  if (trimmed === text) return text;
  return trim(trimmed);
};

export function readMeta(contents: string, vars: string[] = []) {
  const match = commentRegex.exec(contents);
  if (!match) return { };

  const commentText = match[1].trim();
  const meta: AddonMeta = { };

  let tagMatch: RegExpExecArray | null = null;

  while (tagMatch = tagRegex.exec(commentText)) {
    const tagName = tagMatch.at(1)!.toLowerCase();
    const tagDescription = trim(tagMatch.at(2)!);

    if (tagName === "var" || tagName === "advanced") {
      vars.push(tagDescription);
      continue;
    };

    if (tagName in meta) continue;

    meta[tagName] = convertJSDocUrls(tagDescription);
  };

  return meta;
};