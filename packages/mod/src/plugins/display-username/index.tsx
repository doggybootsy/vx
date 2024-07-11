import { useMemo } from "react";

import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Message, User } from "discord-types/general";
import { ErrorBoundary } from "../../components";

import * as styler from "./index.css?managed";

type TypedUser = User & { isPomelo(): boolean, globalName: string | null };

function DisplayUsername({ message, author }: { message: Message & { author: TypedUser }, author: { nick: string } }) {
  const isPomelo = useMemo(() => message.author.isPomelo() || (message.author.discriminator === "0000"), [ message ]);

  if (isPomelo && !message.author.globalName) return;
  if (author.nick === message.author.username) return;

  return (
    <span className="vx-display-username">
      {isPomelo ? "@" : ""}
      {message.author.username}
      {!isPomelo ? `#${message.author.discriminator}` : ""}
    </span>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: 'null,"dot"===',
    find: /null,"dot"===.{1,3}\?.+?:null,.{1,3},/,
    replace: "$&$enabled&&$self.addUsername(...arguments),"
  },
  addUsername({ message, author }: { message: Message & { author: TypedUser }, author: { nick: string } }) {
    return (
      <ErrorBoundary>
        <DisplayUsername message={message} author={author} />
      </ErrorBoundary>
    )
  },
  styler
});