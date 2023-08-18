import webpack, { filters } from "renderer/webpack";
import { setLikeArray, commands } from "renderer/commands/patches/common";
import * as patcher from "renderer/patcher";

webpack.getLazyAndKey(filters.byStrings("BUILT_IN_TEXT", "BUILT_IN_INTEGRATION")).then(([ module, key ]) => {
  patcher.after("VX/Command", module, key, (that, args, res) => {
    if (!Array.isArray(res)) res = [ ];
  
    return setLikeArray([
      ...res,
      ...commands
    ], (a, b) => a.id === b.id);
  });
});