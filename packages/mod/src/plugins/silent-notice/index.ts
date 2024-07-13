import { definePlugin } from "..";
import { Developers } from "../../constants";
import * as styler from "./index.css?managed";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  patches: [
    {
      match: "decorate:this.decorate",
      find: /decorate:this.decorate/,
      replace: "decorate:$self.decorate.bind(this,()=>$enabled)"
    },
    {
      match: 'codeBlockLang"===',
      find: /codeBlockLang:.{1,3}\.codeBlockLang,subtext:.{1,3}\.subtext/,
      replace: "$&,silent:'vx-silent-notice'"
    }
  ],
  decorate(this: any, enabled: () => boolean, [ node, path ]: [ any, [ number, number ] ]) {
    const res = this.decorate([ node, path ]);

    if (!enabled()) return res;

    if (path[0] === 0 && typeof node.text === "string") {
      if (node.text.startsWith("@silent ")) {
        return [
          {
            silent: true,
            children: [ { text: "@silent" } ],
            anchor: { path, offset: 0 },
            focus: { path, offset: 7 },
          },
          {
            type: "text",
            text: " ",
            anchor: { path, offset: 7 },
            focus: { path, offset: 8 },
          }
        ]
      }
    }    

    return res;
  }
});
