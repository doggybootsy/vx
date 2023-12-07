import { memo } from "react";
import { definePlugin } from "../";
import { Developers } from "../../constants";
import { ZipButton } from "./button";

import { addStyle } from "./index.css?managed";

export default definePlugin({
  name: "ZipViewer",
  description: "Allows you to view Zip Files",
  authors: [ Developers.doggybootsy ],
  patches: {
    match: ".spoilerRemoveAttachmentButton:",
    find: /(=(.{1,3})=>.+?hoverButtonGroup,.+?children:)\[(.+?)\]/,
    replace: "$1[$react.createElement($self.ZipViewer,$2),$3]"
  },
  ZipViewer: memo(ZipButton),
  start() {
    addStyle();
  }
});
