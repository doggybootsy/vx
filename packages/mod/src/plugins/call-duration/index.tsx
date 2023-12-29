import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { getProxyByKeys } from "../../webpack";
import { ChannelStore, FluxDispatcher, NavigationUtils, SelectedChannelStore } from "../../webpack/common";

import { addStyle } from "./index.css?managed";
import { Messages } from "@i18n";

const Components = getProxyByKeys([ "Tooltip", "Text" ]);

function CallDuration() {
  const [ then, setThen ] = useState(Date.now);
  const [ elapsed, setElapsed ] = useState(0);
  const [ url, setURL ] = useState(() => {
    const channelId = SelectedChannelStore.getVoiceChannelId()!;
    const channel = ChannelStore.getChannel(channelId);
    return (new URL(`/${channel.guild_id}/${channel.id}`, location.origin)).href;
  });

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
      {Messages.CALL_DURATION.format({ time: new Date(elapsed).toUTCString().split(" ").at(-2) })}
    </Components.Text>
  )
};

export default definePlugin({
  name: () => Messages.CALL_DURATION_NAME,
  description: () => Messages.CALL_DURATION_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    find: "this.renderConnectionStatus()",
    replace: "[$&,$enabled&&$react.createElement($self.CallDuration)]"
  },
  CallDuration: memo(ErrorBoundary.wrap(CallDuration)),
  start: addStyle
});
