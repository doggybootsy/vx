import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: ".default.Messages.MESSAGE_UTILITIES_A11Y_LABEL,",
    find: /canConfigureJoin:.{1,3},isExpanded:/,
    replace: "$&$enabled||"
  }
});
