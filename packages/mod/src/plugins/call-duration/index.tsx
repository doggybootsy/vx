import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { useFluxSubscription } from "../../hooks";
import { getProxyByKeys } from "../../webpack";
import { React } from "../../webpack/common";

import { addStyle } from "./index.css?managed";

const Components = getProxyByKeys([ "Tooltip", "Text" ]);

function CallDuration() {
  const [ then, setThen ] = React.useState(Date.now);
  const [ elapsed, setElapsed ] = React.useState(0);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      setElapsed(Date.now() - then);
    });

    return () => cancelAnimationFrame(id);
  }, [ elapsed, then ]);

  useFluxSubscription("RTC_CONNECTION_STATE", (event) => {
    if (!(event.state === "RTC_DISCONNECTED" && !Reflect.has(event, "streamKey"))) return;

    setThen(Date.now);
  }, [ elapsed, then ]);

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
  CallDuration: ErrorBoundary.wrap(CallDuration),
  start: addStyle
});
