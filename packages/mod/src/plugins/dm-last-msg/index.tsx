import { MessageStore, RelationshipStore, UserStore, useStateFromStores } from "@webpack/common";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import * as styler from "./index.css?managed";
import { Messages } from "vx:i18n";
import { useLayoutEffect, useMemo } from "react";
import { getProxyByKeys, getProxyStore } from "@webpack";
import { Icons } from "../../components";

const CallStore = getProxyStore("CallStore");
const chanelActions = getProxyByKeys([ "preload", "ensurePrivateChannel" ]);

const seen = new Set();
function preload(channelId: string) {
  if (seen.has(channelId)) return;

  seen.add(chanelActions);
  chanelActions.preload(null, channelId);
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  patches: {
    match: "PrivateChannel.renderAvatar",
    find: /subText:(.{1,3}\(\)),/,
    replace: "subText:$jsx($self.LastMessage,{props:arguments[0],original:$1,enabled:$enabled}),"
  },
  LastMessage({ props, original, enabled }: { props: any, original: JSX.Element, enabled: boolean }) {
    const lastMessage = useStateFromStores([ MessageStore ], () => MessageStore.getLastMessage(props.channel.id));
    const lastMsgAuthor = useStateFromStores([ RelationshipStore ], () => {
      if (!lastMessage) return null;

      if (lastMessage.author.id === UserStore.getCurrentUser().id) return Messages.YOU;

      const friendNickName = RelationshipStore.isFriend(lastMessage.author.id) && RelationshipStore.getNickname(lastMessage.author.id);
      if (friendNickName) return friendNickName;
      return (lastMessage.author as any).globalName || lastMessage.author.username;
    });

    useLayoutEffect(() => preload(props.channel.id), []);

    const isInCall = useStateFromStores([ CallStore ], () => CallStore.isCallActive(props.channel.id));

    const content = useMemo(() => {
      if (!lastMessage) return;
      
      const $ = (...content: React.ReactNode[]) => [ lastMsgAuthor, ": ", content ];

      if (isInCall) return Messages.ONGOING_CALL;

      if (lastMessage.content) return $(lastMessage.content);

      if (lastMessage.attachments.length) {
        let images = 0;
        let videos = 0;

        for (const attachment of lastMessage.attachments) {
          const content_type = attachment.content_type || "";
          if (content_type.startsWith("image/")) images++;
          else if (content_type.startsWith("video/")) videos++;
        }

        if (images) return $(
          Messages.NUM_IMAGES.format({ count: images }), 
          <Icons.Image size={16} />
        );
        if (videos) return $(
          Messages.NUM_IMAGES.format({ count: videos }), 
          <Icons.Movie size={16} />
        );
        return $(
          Messages.NUM_ATTACHMENTS.format({ count: lastMessage.attachments.length }), 
          <Icons.File size={16} />
        );
      }
      
      // is call
      if (lastMessage.type === 3) return Messages.CALL_ENDED;

      if (lastMessage.stickerItems.length) {
        return $(
          lastMessage.stickerItems[0]!.name, 
          <Icons.Sticker size={16} />
        );
      }

      // Is group dm
      if (props.channel.type === 3) return Messages.NUM_USERS.format({ users: props.channel.recipients.length });
    }, [ lastMessage, lastMsgAuthor, isInCall ]);

    if (!enabled) return original;
    if (original && props.channel.type !== 3) return original;
    if (!lastMessage) return;

    return (
      <span className="vx-dmlm" data-is-call-ongoing={String(isInCall)}>
        {content}
      </span>
    );
  }
})