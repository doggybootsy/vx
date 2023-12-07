import { memo } from "react";
import { definePlugin } from "../";
import { Developers } from "../../constants";
import { ZipButton } from "./button";

import { addStyle } from "./index.css?managed";

export function isZIP(filename: string) {
  return /\.(zip|rar|tar)($|\?|#)/.test(filename);
};

export default definePlugin({
  name: "ArchiveViewer",
  description: "Allows you to view the contents of archives",
  authors: [ Developers.doggybootsy ],
  patches: {
    match: ".spoilerRemoveAttachmentButton:",
    find: /(=(.{1,3})=>.+?hoverButtonGroup,.+?children:)\[(.+?)\]/,
    replace: "$1[$react.createElement($self.ZipButton,$2),$3]"
  },
  ZipButton: memo(ZipButton),
  start() {
    addStyle();
  }
});
