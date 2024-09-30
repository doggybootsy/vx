import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { getProxyByKeys } from "@webpack";
import { ChannelStore, FluxDispatcher, NavigationUtils, SelectedChannelStore, subscribeToDispatch } from "@webpack/common";

import * as styler from "./index.css?managed";
import { Messages } from "vx:i18n";
import { InternalStore, simpleFormatTime } from "../../util";
import { useInternalStore } from "../../hooks";

const Components = getProxyByKeys([ "Tooltip", "Text" ]);

class CallDurationStore extends InternalStore {
  constructor() {
    super();

    subscribeToDispatch("RTC_CONNECTION_STATE", (event) => {
      if (event.context !== "default") return;      

      if (event.state === "CONNECTING") {
        if (this.lastChannelId === event.channelId) return;
        this.then = Date.now();
        this.lastChannelId = event.channelId;

        this.emit();

        return;
      }

      if (event.state === "DISCONNECTED") {
        this.then = null;
        this.lastChannelId = null;

        this.emit();

        return;
      }
    });
  }

  private lastChannelId: string | null = null;
  public then: number | null = null;
}

const store = new CallDurationStore();

function CallDuration() {
  const then = useInternalStore(store, () => store.then!);

  const [ elapsed, setElapsed ] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setElapsed(Date.now() - then);
    }, 450);
    return () => clearTimeout(timer);
  }, [ elapsed, then ]);

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
