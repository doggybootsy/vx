import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { getProxyByKeys } from "@webpack";
import { ChannelStore, FluxDispatcher, NavigationUtils, SelectedChannelStore } from "@webpack/common";

import * as styler from "./index.css?managed";
import { Messages } from "vx:i18n";
import { simpleFormatTime } from "../../util";

const Components = getProxyByKeys([ "Tooltip", "Text" ]);

function CallDuration() {
  const [ then, setThen ] = useState(Date.now);
  const [ elapsed, setElapsed ] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setElapsed(Date.now() - then);
    }, 450);
    return () => clearTimeout(timer);
  }, [ elapsed, then ]);

  useLayoutEffect(() => {
    function actionHandler(event: any) {
      if (!(event.state === "RTC_DISCONNECTED" && !Reflect.has(event, "streamKey"))) return;
  
      setThen(Date.now);
    };

    FluxDispatcher.subscribe("RTC_CONNECTION_STATE", actionHandler);

    return () => FluxDispatcher.unsubscribe("RTC_CONNECTION_STATE", actionHandler);
  }, [ ]);

  return (
    <Components.Text 
      variant="text-xs/normal" 
      color="none" 
      className="vx-call-duration" 
      onClick={() => {
        const channelId = SelectedChannelStore.getVoiceChannelId()!;
        const channel = ChannelStore.getChannel(channelId);

        NavigationUtils.transitionTo(`/channels/${channel.guild_id || "@me"}/${channel.id}`);
      }}
    >
      {Messages.CALL_DURATION.format({ time: simpleFormatTime(elapsed) })}
    </Components.Text>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    find: "this.renderConnectionStatus()",
    replace: "[$&,$enabled&&$jsx($self.CallDuration)]"
  },
  CallDuration: memo(ErrorBoundary.wrap(CallDuration)),
  styler
});
