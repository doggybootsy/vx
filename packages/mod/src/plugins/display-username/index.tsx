import { useMemo } from "react";

import { definePlugin } from "vx:plugins";
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
    match: ".communicationDisabledOpacity]:",
    find: /(children:(.{1,3})}\)),(.{1,3}&&!.{1,3}&&\(0,.{1,3}\.jsx\)\(.{1,3}\.Z,{id:\(0,.{1,3}\..{1,3}\)\(.{1,3}\),timestamp:.{1,3}\.timestamp)/,
    replace: "$1,$enabled&&$self.addUsername({...arguments[0],author:$2}),$3"
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