import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "DoubleClickToCall",
  description: "You need to double click to start a call instead of a single click",
  authors: [ Developers.doggybootsy ],
  patches: [
    {
      match: "[this.renderVoiceCallButton(),this.renderVideoCallButton()]",
      find: /(\(.{1,3}\.default\.Icon,{icon:.{1,3}\.default,onClick:)(.+?),/g,
      replace: "$1$self._wrapOnClick($2),"
    }
  ],
  _wrapOnClick(onClick: (event: React.MouseEvent) => void) {
    return (event: React.MouseEvent) => {
      if (event.detail !== 2) return;

      onClick(event);
    };
  }
});
