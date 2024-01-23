import { memo } from "react";
import { definePlugin } from "../";
import { Developers } from "../../constants";
import { ZipButton } from "./button";

import * as styler from "./index.css?managed";

export function isZIP(filename: string) {
  return /\.(zip|rar|tar)($|\?|#)/.test(filename);
};

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: ".spoilerRemoveAttachmentButton:",
    find: /(=(.{1,3})=>.+?hoverButtonGroup,.+?children:)\[(.+?)\]/,
    replace: "$1[$enabled&&$react.createElement($self.ZipButton,$2),$3]"
  },
  ZipButton: memo(ZipButton),
  styler
});
