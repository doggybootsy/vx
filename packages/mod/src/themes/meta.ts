export interface AddonMeta {
  name: string;
  description?: string;
  version: string;
  author: string;
  authorid?: string;
  source?: string;
  [key: string]: string | void
};

const commentRegex = /\/\*\*([\s\S]*?)\*\//;
const tagRegex = /\s*@(\w+)\s+([\s\S]*?(?=(?:\s@\w+)|$))/g;

// Remove the white space and *
function trim(text: string) {
  const trimmed = text.replace(/\s+\*$/, "");
  if (trimmed === text) return text;
  return trim(trimmed);
};

const fallbackMeta = {
  name: "Unknown Name",
  version: "?.?.?",
  author: "Unknown Author"
};

export function readMeta(contents: string): AddonMeta {
  const match = commentRegex.exec(contents);
  if (!match) return fallbackMeta;

  const commentText = match[1].trim();
  const meta: Record<keyof AddonMeta, string | void> = { };

  let tagMatch: RegExpExecArray | null = null;

  while (tagMatch = tagRegex.exec(commentText)) {
    const tagName = tagMatch.at(1)!.toLowerCase();
    const tagDescription = trim(tagMatch.at(2)!);

    if (tagName in meta) continue;

    meta[tagName] = tagDescription;
  };

  return Object.assign({}, fallbackMeta, meta) as AddonMeta;
};