import { AddonMeta } from "common";

const commentRegex = /\/\*\*([\s\S]*?)\*\//;
const tagRegex = /\s*@(\w+)\s+([\s\S]*?(?=(?:\s@\w+)|$))/g;

const jsDocLinkRegex = /\{@link\s+([^}|]+)(?:\|([^}]+))?\}/g;
function convertJSDocUrls(data: string) {
  return data.replace(jsDocLinkRegex, (match, linkText, linkUrl) => {
    return linkUrl ? linkUrl : linkText;
  });
};

export function readMeta(contents: string) {
  const match = commentRegex.exec(contents);
  if (!match) return { };

  const commentText = match[1].trim();
  const meta: AddonMeta = { };

  let tagMatch: RegExpExecArray | null = null;

  while ((tagMatch = tagRegex.exec(commentText)) !== null) {
    const tagName = tagMatch[1];
    const tagDescription = tagMatch[2].replace(/\*$/, "").trim();
    meta[tagName] = convertJSDocUrls(tagDescription);
  };

  return meta;
};