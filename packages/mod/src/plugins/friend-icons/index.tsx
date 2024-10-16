import { Message, User } from "discord-types/general";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { RelationshipStore, useStateFromStores } from "@webpack/common";
import { Icons, Tooltip } from "../../components";
import { Messages } from "vx:i18n";

import * as styler from "./index.css?managed";
import { useMemo } from "react";

const icons = {
  NONE: null,
  FRIEND: [
    Icons.DiscordIcon.from("FriendsIcon"),
    () => Messages.FRIENDS
  ],
  BLOCKED: [
    Icons.DiscordIcon.from("DenyIcon"),
    () => Messages.BLOCKED
  ],
  PENDING_INCOMING: [
    Icons.DiscordIcon.from("UserPlusIcon"),
    () => Messages.FRIEND_REQUEST_ACCEPT
  ],
  PENDING_OUTGOING: [
    Icons.DiscordIcon.from("UserClockIcon"),
    () => Messages.FRIENDS_SECTION_PENDING
  ],
  IMPLICIT: [
    Icons.DiscordIcon.from("GroupIcon"),
    () => "Implicit Friend"
  ],
  SUGGESTION: [
    Icons.DiscordIcon.from("NearbyScanIcon"),
    () => Messages.FRIENDS_SECTION_SUGGESTIONS
  ],
  0: "NONE",
  1: "FRIEND",
  2: "BLOCKED",
  3: "PENDING_INCOMING",
  4: "PENDING_OUTGOING",
  5: "IMPLICIT",
  6: "SUGGESTION",
} as const;

type FriendType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function FriendIcon({ user }: { user: User }) {
  const type = useStateFromStores([ RelationshipStore ], () => RelationshipStore.getRelationshipType(user.id) as FriendType);
  const data = icons[icons[type]];

  if (!data) return null;

  const [ Icon, text ] = data;

  return (
    <Tooltip text={text()} hideOnClick={false}>
      {(props) => (
        <span {...props} className="vx-friend-icon">
          <Icon size={20} />
        </span>
      )}
    </Tooltip>
  );
}

definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  icon: Icons.DiscordIcon.from("FriendsIcon"),
  patches: {
    match: ".communicationDisabledOpacity]:",
    find: /(,.{1,3}&&.{1,3}),(\(0,.{1,3}\.jsx\)\("span",{id:.{1,3},className:.{1,3},children:.{1,3}}\))/,
    replace: "$1,$enabled&&$self.addIcon(...arguments),$2"
  },
  addIcon({ message }: { message: Message }) {
    return (
      <FriendIcon user={message.author} />
    )
  },
  styler
});