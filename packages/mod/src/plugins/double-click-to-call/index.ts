import { Messages } from "@i18n";
import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: () => Messages.DOUBLE_CLICK_CALL_NAME,
  description: () => Messages.DOUBLE_CLICK_CALL_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      match: "[this.renderVoiceCallButton(),this.renderVideoCallButton()]",
      find: /(\(.{1,3}\.default\.Icon,{icon:.{1,3}\.default,onClick:)(.+?),/g,
      replace: "$1$self._wrapOnClick($2,()=>$enabled),"
    }
  ],
  _wrapOnClick(onClick: (event: React.MouseEvent) => void, enabled: () => boolean) {
    return (event: React.MouseEvent) => {
      if (!enabled()) return onClick(event);

      if (event.detail !== 2) return;

      onClick(event);
    };
  }
});
