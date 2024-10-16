import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "this.renderVoiceCallButton()",
    find: /"handleStartCall",\((.{1,3}),.{1,3}\)=>{/,
    replace: "$&if($self.onClick($1,$enabled)) return;"
  },
  onClick(event: React.MouseEvent, enabled: boolean) {
    return enabled && event.detail !== 2;
  }
});
