import { Message, User } from "discord-types/general";
import { definePlugin } from "vx:plugins";
import { ErrorBoundary, Icons, UserPopout } from "../../components";
import { Developers } from "../../constants";
import {
  ChannelStore,
  Constants,
  GuildMemberStore,
  MessageActions,
  MessageStore,
  NavigationUtils,
  PermissionStore,
  RelationshipStore,
  UserStore,
  useStateFromStores
} from "@webpack/common";
import { useEffect, useMemo, useState } from "react";
import { focusStore, getDefaultAvatar } from "../../util";
import * as styler from "./index.css?managed";

function Avatar({ author }: { author: User }) {
  const hasFocus = focusStore.useFocus();
  const randomDefaultAvatar = useMemo(() => getDefaultAvatar(author.id), [ ]);

  const [ shouldShow, setShouldShow ] = useState(false);

  const authorIcon = useMemo(() => {    
    const url = author.getAvatarURL(undefined, 40, hasFocus);
    return url || randomDefaultAvatar;
  }, [ author, hasFocus, randomDefaultAvatar ]);

  return (
    <UserPopout shouldShow={shouldShow} user={author} onRequestClose={() => setShouldShow(false)}>
      {(props) => (
        <img
          src={authorIcon} 
          className="vx-bfm-avatar" 
          {...props} 
          onClick={(event) => {
            props.onClick(event);
            if (!shouldShow) setShouldShow(true);
          }}
        />
      )}
    </UserPopout>
  );
}

function Username({ author, guildId }: { author: User, guildId: string }) {
  const [ shouldShow, setShouldShow ] = useState(false);
  const name = useMemo(() => {
    const friendNickName = RelationshipStore.isFriend(author.id) && RelationshipStore.getNickname(author.id);
    if (friendNickName) return friendNickName;
    // @ts-expect-error
    return author.globalName || author.username;
  }, [ author ]);

  return (
    <UserPopout shouldShow={shouldShow} user={author} guildId={guildId} onRequestClose={() => setShouldShow(false)}>
      {(props) => (
        <div style={{color: GuildMemberStore.getMember(guildId, author.id)?.colorString ?? void 0}}
          className="vx-bfm-username"
          {...props} 
          onClick={(event) => {
            props.onClick(event);
            if (!shouldShow) setShouldShow(true);
          }}
        >
          {name}
        </div>
      )}
    </UserPopout>
  );
}

function Author({ userId, guildId }: { userId: string, guildId: string | undefined}) {
  const user = useStateFromStores([ UserStore ], () => UserStore.getUser(userId));

  return (
    <div className="vx-bfm-user">
      <Avatar author={user} />
      <Username author={user} guildId={guildId!} />
    </div>
  )
}

interface ForwardedMessageProps {
  message: Message, 
  original: JSX.Element
}

function ForwardedMessage({ message, original }: ForwardedMessageProps) {
  const canViewChannel = useStateFromStores([ ChannelStore, PermissionStore ], () => {
    const channel = ChannelStore.getChannel(message.messageReference!.channel_id);
    if (!channel) return false;

    if (channel.isDM() || channel.isMultiUserDM() || channel.isGroupDM()) return true;

    return (
      PermissionStore.can(Constants.Permissions.VIEW_CHANNEL, channel)
    );
  });
  const [ forwardedMessage, setForwardedMessage ] = useState(() => (
    MessageStore.getMessage(message.messageReference!.channel_id, message.messageReference!.message_id)
  ));
  
  useEffect(() => {    
    if (forwardedMessage) return;
    if (!canViewChannel) return;
    
    MessageActions.fetchMessage({
      channelId: message.messageReference!.channel_id,
      messageId: message.messageReference!.message_id
    }).then((message: Message) => {      
      if (message) setForwardedMessage(message);
    });
  }, [ canViewChannel ]);

  if (!forwardedMessage) return original;
  
  return (
    <div className="vx-bfm">
      <Author userId={forwardedMessage.author.id} guildId={message.messageReference!.guild_id} />
      <div 
        className="vx-bfm-jump"
        role="button"
        aria-disabled={!canViewChannel}
        onClick={() => {
          if (!canViewChannel) return;
          
          NavigationUtils.transitionToGuild(
            message.messageReference!.guild_id || null,
            message.messageReference!.channel_id,
            message.messageReference!.message_id
          );
        }}
      >
        {original}
      </div>
    </div>
  )
}

definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  icon: Icons.Forward,
  patches: [
    {
      find: /\[(\(0,.{1,3}\.jsx\)\(.{1,3},{}\)),(\(0,.{1,3}\.jsx\)\(.{1,3}\.ZP,{message:(.{1,3}),)/,
      replace: "[$enabled?$jsx($self.ForwardedMessage,{message:$3,original:$1}):$1,$2",
    }
  ],
  ForwardedMessage(props: ForwardedMessageProps) {
    return (
      <ErrorBoundary fallback={props.original}>
        <ForwardedMessage {...props} />
      </ErrorBoundary>
    )
  }
});