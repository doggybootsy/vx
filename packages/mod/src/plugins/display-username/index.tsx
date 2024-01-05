import { useMemo } from "react";

import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Message, User } from "discord-types/general";
import { ErrorBoundary } from "../../components";

import { addStyle, removeStyle } from "./index.css?managed";
import { Messages } from "i18n";

type TypedUser = User & { isPomelo(): boolean, globalName: string | null };

export default definePlugin({
  name: () => Messages.DISPLAY_USERNAME_NAME,
  description: () => Messages.DISPLAY_USERNAME_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "showCommunicationDisabledStyles:",
    find: /,(.{1,3}&&!.{1,3}&&\(.+?getMessageTimestampId\)\((.{1,3})\))/,
    replace: ",$enabled&&$react.createElement($self.DisplayUsername,$2),$1"
  },
  start() {
    addStyle();
  },
  stop() {
    removeStyle();
  },
  DisplayUsername: ErrorBoundary.wrap((message: Message & { author: TypedUser }) => {
    const isPomelo = useMemo(() => message.author.isPomelo() || (message.author.discriminator === "0000"), [ message ]);

    if (isPomelo && !message.author.globalName) return;
  
    return (
      <span className="vx-display-username">
        {isPomelo ? "@" : ""}
        {message.author.username}
        {!isPomelo ? `#${message.author.discriminator}` : ""}
      </span>
    );
  })
});