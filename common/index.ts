export type AddonMeta = {
  name?: string;
  description?: string;
  version?: string;
  author?: string;
  authorid?: string;
  source?: string;
} & Record<Lowercase<string>, string>;