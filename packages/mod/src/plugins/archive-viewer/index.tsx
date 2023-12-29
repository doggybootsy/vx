import { memo } from "react";
import { definePlugin } from "../";
import { Developers } from "../../constants";
import { ZipButton } from "./button";

import { addStyle, removeStyle } from "./index.css?managed";
import { Messages } from "@i18n";

export function isZIP(filename: string) {
  return /\.(zip|rar|tar)($|\?|#)/.test(filename);
};

export default definePlugin({
  name: () => Messages.ARCHIVE_VIEWER_NAME,
  description: () => Messages.ARCHIVE_VIEWER_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: ".spoilerRemoveAttachmentButton:",
    find: /(=(.{1,3})=>.+?hoverButtonGroup,.+?children:)\[(.+?)\]/,
    replace: "$1[$enabled&&$react.createElement($self.ZipButton,$2),$3]"
  },
  ZipButton: memo(ZipButton),
  start() {
    addStyle();
  },
  stop() {
    removeStyle();
  }
});
