import { MessageStore, RelationshipStore, UserStore, useStateFromStores } from "@webpack/common";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import * as styler from "./index.css?managed";
import { Messages } from "vx:i18n";
import { useLayoutEffect, useMemo } from "react";
import { getProxyByKeys, getProxyStore } from "@webpack";
import {ErrorBoundary, Icons, Tooltip} from "../../components";
import {createSettings, SettingType} from "../settings";

const CallStore = getProxyStore("CallStore");
const chanelActions = getProxyByKeys([ "preload", "ensurePrivateChannel" ]);
const settings = createSettings("dm-last-message", {
  showTooltipWithMessage: {
    type: SettingType.SWITCH,
    default: true,
    title: "Show Tooltip on messages",
    description: "Toggles mimicking statuses",
  },
  removeNameInMessage: {
    type: SettingType.SWITCH,
    default: false,
    disabled(settings) {
      return !settings.showTooltipWithMessage.get();
    },
    title: "Remove Username in Tooltip",
    description: "Removes the `username` (e.g.. Username: hello world!) in the tooltip.",
  }
});

const seen = new Set<string>();
const queue: string[] = [];
const BATCH_SIZE = 15;
const DELAY = 1_500;

function preload(channelId: string) {
  if (seen.has(channelId)) return;

  seen.add(channelId);
  queue.push(channelId);

  if (queue.length === 1) {
    processQueue();
  }
}

function processQueue() {
  if (queue.length === 0) return;

  const batch = queue.splice(0, BATCH_SIZE);
  batch.forEach(channelId => {
    // Replace this with your actual API call
    chanelActions.preload(null, channelId);
  });

  if (queue.length > 0) {
    setTimeout(processQueue, DELAY);
  }
}


function LastMessage({ props, original, enabled }: { props: any, original: JSX.Element, enabled: boolean }) {
  const lastMessage = useStateFromStores([ MessageStore ], () => MessageStore.getLastMessage(props.channel.id));
  const lastMsgAuthor = useStateFromStores<string>([ RelationshipStore ], () => {
    if (!lastMessage) return null;

    if (lastMessage.author.id === UserStore.getCurrentUser().id) return Messages.YOU;

    const friendNickName = RelationshipStore.isFriend(lastMessage.author.id) && RelationshipStore.getNickname(lastMessage.author.id);
    if (friendNickName) return friendNickName;
    return (lastMessage.author as any).globalName || lastMessage.author.username;
  });

  useLayoutEffect(() => enabled ? preload(props.channel.id) : void 0, [ enabled ]);

  const isInCall = useStateFromStores([ CallStore ], () => CallStore.isCallActive(props.channel.id));

  const removeNameInMessage = settings.removeNameInMessage.use();
  const showTooltip = settings.showTooltipWithMessage.use();

  const content = useMemo(() => {
    if (!lastMessage) return [];
    
    const $ = (...content: React.ReactNode[]): React.ReactNode[] => [ `${lastMsgAuthor}: `, content ];

    if (isInCall) return [ Messages.ONGOING_CALL ];

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
    if (lastMessage.type === 3) return [ Messages.CALL_ENDED ];

    if (lastMessage.stickerItems.length) {
      return $(
        lastMessage.stickerItems[0]!.name, 
        <Icons.Sticker size={16} />
      );
    }

    // Is group dm
    if (props.channel.type === 3) return [
      Messages.NUM_USERS.format({ num: props.channel.recipients.length })
    ];

    return [];
  }, [ lastMessage, lastMsgAuthor, isInCall ]);


  if (!enabled) return original;
  if (original && props.channel.type !== 3) return original;
  if (!lastMessage) return;

  return showTooltip ? (
    <Tooltip text={(removeNameInMessage && content[0] === `${lastMsgAuthor}: `) ? content.slice(1) : content} aria-label={String(content)}>
      {({ ...tooltipProps }) => (
          <span className="vx-dmlm" data-is-call-ongoing={isInCall} {...tooltipProps}>
            {content}
         </span>
      )}
    </Tooltip>
  ) : (
    <span className="vx-dmlm" data-is-call-ongoing={isInCall}>
      {content}
    </span>
  );
}

export default definePlugin({
  authors: [ Developers.doggybootsy, Developers.kaan ],
  requiresRestart: false,
  styler,
  settings: settings,
  patches: {
    match: "PrivateChannel.renderAvatar",
    find: /subText:(.{1,3}\(\)),/,
    replace: "subText:$jsx($self.LastMessage,{props:arguments[0],original:$1,enabled:$enabled}),"
  },
  LastMessage: ErrorBoundary.wrap(LastMessage)
})