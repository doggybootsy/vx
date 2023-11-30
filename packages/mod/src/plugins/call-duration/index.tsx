import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { getProxyByKeys } from "../../webpack";
import { FluxDispatcher } from "../../webpack/common";

import { addStyle } from "./index.css?managed";

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
    <Components.Text variant="text-xs/normal" color="none" className="vx-call-duration">
      {`Call Duration: ${new Date(elapsed).toUTCString().split(" ").at(-2)}`}
    </Components.Text>
  )
};

export default definePlugin({
  name: "CallDuration",
  description: "Shows how long you have been in call for",
  authors: [ Developers.doggybootsy ],
  patches: {
    find: "this.renderConnectionStatus()",
    replace: "[$&,$react.createElement($self.CallDuration)]"
  },
  CallDuration: memo(ErrorBoundary.wrap(CallDuration)),
  start: addStyle
});
