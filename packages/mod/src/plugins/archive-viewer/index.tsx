import { memo } from "react";
import { definePlugin } from "../";
import { Developers } from "../../constants";
import { ZipButton } from "./button";

import * as styler from "./index.css?managed";
import { escapeRegex } from "../../util";

const archiveFileTypes = [
  "zip",
  "mcaddon", "mcpack", "mcworld",
  "rar",
  "tar",
  "tar.gz",
  "asar"
].map((value) => escapeRegex(value).source);

const FILE_REGEX = new RegExp(`\\.(${archiveFileTypes.join("|")})($|\\?|#)`);

export function isArchive(filename: string) {
  return FILE_REGEX.test(filename);
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: ".Messages.REMOVE_ATTACHMENT_TOOLTIP_TEXT",
    find: /(=(.{1,3})=>.+?hoverButtonGroup,.+?children:)\[(.+?)\]/,
    replace: "$1[$enabled&&$jsx($self.ZipButton,$2),$3]"
  },
  ZipButton: memo(ZipButton),
  styler
});
