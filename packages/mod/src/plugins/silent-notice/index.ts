import { definePlugin } from "..";
import { Developers } from "../../constants";
import * as styler from "./index.css?managed";

const silentRegex = /^(\s*)@silent(\s|$)/;

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
      const exec = silentRegex.exec(node.text);
      if (exec) {
        const ranges = [
          {
            type: "text",
            text: exec[1],
            anchor: { path, offset: 0 },
            focus: { path, offset: exec[1].length },
          },
          {
            silent: true,
            children: [ { text: "@silent" } ],
            anchor: { path, offset: exec[1].length },
            focus: { path, offset: exec[1].length + 7 },
          },
          {
            type: "text",
            text: exec[2],
            anchor: { path, offset: exec[1].length + 7 },
            focus: { path, offset: exec[1].length + 7 + exec[2].length },
          }
        ]

        return ranges;
      }
    }    

    return res;
  }
});
