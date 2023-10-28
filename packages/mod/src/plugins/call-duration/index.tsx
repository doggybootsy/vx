import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { getProxyByKeys } from "../../webpack";
import { FluxDispatcher, React } from "../../webpack/common";

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

  React.useEffect(() => {
    function listener() {
      setThen(Date.now);
    };

    FluxDispatcher.subscribe("RTC_CONNECTION_STATE", listener);

    return () => FluxDispatcher.unsubscribe("RTC_CONNECTION_STATE", listener);
  }, [ elapsed, then ]);

  return (
    <Components.Text variant="text-xs/normal" color="none" className="vx-call-duration">
      {`Duration: ${new Date(elapsed).toUTCString().split(" ").at(-2)}`}
    </Components.Text>
  )
};

export default definePlugin({
  name: "CallDuration",
  description: "Quickly copy channel links",
  authors: [ Developers.doggybootsy ],
  patches: {
    find: "this.renderConnectionStatus()",
    replace: "[$&,$react.createElement($self.CallDuration)]"
  },
  CallDuration: ErrorBoundary.wrap(CallDuration),
  start: addStyle
});
