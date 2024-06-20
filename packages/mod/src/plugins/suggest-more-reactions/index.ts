import { definePlugin } from "..";
import { Developers } from "../../constants";
import * as styler from "./index.css?managed"

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  patches: {
    match: ".Messages.ADD_REACTION_NAMED",
    replacements: [
      {
        find: /;((.{1,3})\.length>4&&\(\2\.length=4\);)/,
        replace: ";if(!$enabled)$1"
      },
      {
        find: /className:(.{1,3}\.wrapper)/,
        replace: "className:$vx.util.className({[$1]:true,'vx-sme':$enabled})"
      }
    ]
  }
});