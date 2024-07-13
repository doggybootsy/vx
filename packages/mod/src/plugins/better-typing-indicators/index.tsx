import { isValidElement, useEffect, useMemo, useState } from "react";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { GuildMemberStore, SelectedChannelStore, UserStore, fetchUser, openUserContextMenu, useStateFromStores } from "@webpack/common";

import * as styler from "./index.css?managed";
import { ErrorBoundary, Mask, Popout, Spinner, Tooltip, UserPopout } from "../../components";
import { SettingType, createSettings } from "../settings";
import { getProxy, getProxyByKeys, getProxyStore } from "@webpack";
import { useInternalStore } from "../../hooks";
import { className, focusStore } from "../../util";
import { ListFormat } from "../../intl";
import { Messages } from "vx:i18n";
import { Channel, Guild } from "discord-types/general";

const settings = createSettings("better-typing-indicators", {
  roleColor: {
    type: SettingType.SWITCH,
    title: "Use Role Color",
    description: "Sets the color of the name to the role color",
    default: true
  },
  avatars: {
    type: SettingType.SWITCH,
    title: "Show Avatars",
    description: "Shows the users avatar",
    default: true
  },
  avatarOnly: {
    type: SettingType.SWITCH,
    title: "Show Avatars Only",
    description: "Only shows the users avatars",
    default: false
  },
  channelIndicators: {
    type: SettingType.SWITCH,
    title: "Channel Indicators",
    description: "Tells you if someone is typing in a channel",
    default: true
  }
});

const MAX_BUBBLES = 10;

const avatarModule = getProxy((m) => m.default?.getUserAvatarURL);

function TypingUser({ id, guildId, channelId, avatarOnly, isLast }: { id: string, guildId: string | null, channelId: string, avatarOnly?: true, isLast?: boolean }) {
  const [ shouldShow, setShouldShow ] = useState(false);

  const showAvatar = settings.avatars.use();
  const useRoleColor = settings.roleColor.use();

  const user = useStateFromStores([ UserStore ], () => UserStore.getUser(id));
  const member = useStateFromStores([ GuildMemberStore ], () => guildId ? GuildMemberStore.getMember(guildId, id) : null);
  const hasFocus = useInternalStore(focusStore, () => focusStore.hasFocus);

  useEffect(() => {
    if (!user) fetchUser(id).catch();
  }, [ user ]);

  const { username, color, avatar } = useMemo(() => {
    if (!user) return {
      username: "unknown user",
      color: null,
      avatar: avatarModule.default.getUserAvatarURL(id)
    }
   
    if (member?.nick) return { 
      username: member.nick, 
      color: member.colorString,
      avatar: user.getAvatarURL(guildId || undefined, 80, hasFocus)
    };

    return {
      username: (user as unknown as { globalName: string | null }).globalName || user.username, 
      color: null,
      avatar: user.getAvatarURL(guildId || undefined, 80, hasFocus)
    };
  }, [ user, member, hasFocus ]);

  return (
    <UserPopout
      onRequestClose={() => setShouldShow(false)}
      align="center"
      position="top"
      shouldShow={shouldShow}
      user={id}
      guildId={guildId || undefined}
      channelId={channelId}
    >
      {(props) => (
        <strong 
          className="vx-bti-user"
          data-show-avatar={(showAvatar || Boolean(avatarOnly)).toString()}
          data-avatar-only={avatarOnly ? "true" : "false"}
          onClick={() => setShouldShow(true)} 
          onContextMenu={(event) => openUserContextMenu(event, id, true)}
          style={{ color: (useRoleColor && color) || undefined }}
        >
          {avatarOnly ? (
            <Tooltip text={username}>
              {(props) => (
                <Mask mask={isLast ? "none" : "avatar-overlay"} className="vx-bti-pfp-wrapper" height={18} width={18}>
                  <img {...props} src={avatar} className="vx-bti-pfp" />
                </Mask>
              )}
            </Tooltip>
          ) : (
            <>
              {showAvatar && (
                <img src={avatar} className="vx-bti-pfp" />
              )}
              <span className="vx-bti-name">
                {username}
              </span>
            </>
          )}
        </strong>
      )}
    </UserPopout>
  )
}

const formatter = new ListFormat({ type: "conjunction", style: "long" });

const classes = getProxyByKeys<Record<string, string>>([ "iconItem", "selected" ]);

const TypingStore = getProxyStore("TypingStore");

function TypingIndicator({ typingUsers, guildId, channelId, isPopout }: { typingUsers: string[], guildId: string | null, channelId: string, isPopout: boolean }) {
  if (isPopout) {
    return typingUsers.map((id) => (
      <TypingUser id={id} key={id} guildId={guildId} channelId={channelId} />
    ));
  }
  
  if (settings.avatarOnly.use()) {
    if (typingUsers.length > 10) {
      const ids = typingUsers.slice(0, MAX_BUBBLES - 1);
      const extra = typingUsers.slice(MAX_BUBBLES - 1);

      return (
        <span className="vx-bti-users">
          {ids.map((id) => (
            <TypingUser id={id} key={id} guildId={guildId} channelId={channelId} avatarOnly />
          ))}
          <Tooltip text={`${extra.length} more people are typing`}>
            {(props) => (
              <strong {...props} className="vx-bti-extra">
                <span className="vx-bti-extra-content">
                  +{extra.length}
                </span>
              </strong>
            )}
          </Tooltip>
          {!isPopout && " are typing..."}
        </span>
      )
    }

    return (
      <span className="vx-bti-users">
        {typingUsers.map((id, index) => (
          <TypingUser id={id} key={id} guildId={guildId} channelId={channelId} avatarOnly isLast={index === (typingUsers.length - 1)} />
        ))}
        {isPopout ? null : typingUsers.length === 1 ? " is typing..." : " are typing..."}
      </span>
    )
  }

  switch (typingUsers.length) {
    case 1: {
      return (
        <span className="vx-bti-users">
          <TypingUser id={typingUsers[0]} guildId={guildId} channelId={channelId} />
          {" is typing..."}
        </span>
      )
    }
    case 2:
    case 3: {
      return (
        <span className="vx-bti-users">
          {formatter.formatToParts(typingUsers).map((part) => part.type === "literal" ? part.value : (
            <TypingUser id={part.value} key={part.value} guildId={guildId} channelId={channelId} />
          ))}
          {" are typing..."}
        </span>
      )
    }
  
    default: {
      return (
        <span className="vx-bti-users">
          {Messages.SEVERAL_USERS_TYPING}
        </span>
      )
    }
  }
}

function TypingPopout(props: {
  guildId: string | null,
  channelId: string,
  typingUsers: string[]
}) {
  return (
    <div className="vx-bti-popout">
      <TypingIndicator typingUsers={props.typingUsers} guildId={props.guildId} channelId={props.channelId} isPopout />
    </div>
  )
}

function ChannelTypingIndicator(props: {
  guild: Guild | null,
  channel: Channel,
  isDmsList: boolean
}) {
  const isCurrentChannel = useStateFromStores([ SelectedChannelStore ], () => SelectedChannelStore.getChannelId() === props.channel.id);

  const typingUsers = useStateFromStores([ TypingStore, UserStore ], () => {
    const typingUsers = Object.keys(TypingStore.getTypingUsers(props.channel.id));

    const index = typingUsers.indexOf(UserStore.getCurrentUser().id);
    if (index !== -1) {
      typingUsers.splice(index, 1);
    }

    return typingUsers;
  });
  
  const [ isShowing, shouldShow ] = useState(false);

  if (isCurrentChannel || !typingUsers.length) return;

  return (
    <Popout 
      shouldShow={isShowing}
      position="top"
      align="center"
      animation={Popout.Animation.NONE}
      onRequestClose={() => shouldShow(false)}
      renderPopout={() => (
        <TypingPopout typingUsers={typingUsers} channelId={props.channel.id} guildId={props.guild?.id || null} />
      )}
    >
      {(pprops) => (
        <div
          {...pprops}
          className={className([ props.isDmsList ? "vx-bti-dm" : `${classes.iconItem} ${classes.alwaysShown} ${classes.iconNoChannelInfo}` ])}
          onMouseOver={() => shouldShow(true)}
          onMouseLeave={() => shouldShow(false)}
        >
          <Spinner type={Spinner.Type.PULSING_ELLIPSIS} />
        </div>
      )}
    </Popout>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      identifier: "chatbar",
      match: ".Messages.ONE_USER_TYPING.format",
      find: /class .{1,3} extends .{1,3}\.PureComponent{componentDidMount\(\){.{1,3}?\..+constructor\(\.{3}.{1,3}\){super\(\.{3}.{1,3}\)/,
      replace: "$&,$enabled&&$self.patch(this)"
    },
    {
      identifier: "channels",
      match: "renderAcceptSuggestionButton",
      find: /(!.{1,3}&&this\.renderChannelInfo\(\))\]/g,
      replace: "$1,$enabled&&$jsx($self.TypingIndicator,this.props)]"
    },
    {
      identifier: "dms",
      match: "PrivateChannel.renderAvatar",
      find: /,.{1,3}\?\(0,.{1,3}\.jsx\)\(.{1,3},{}\):null,.+?,onMouseDown:.{1,3}}\)\]/,
      replace: ",$enabled&&$jsx($self.DmTypingIndicator,arguments[0])$&"
    }
  ],
  settings,
  styler,
  TypingIndicator: ErrorBoundary.wrap(ChannelTypingIndicator),
  DmTypingIndicator: ErrorBoundary.wrap((props: any) => {
    if (props.selected) return null;
    return <ChannelTypingIndicator guild={null} channel={props.channel} isDmsList />;
  }),
  patch(component: React.Component) {
    if ((component.render as any).__vx__) return;

    const render = component.render;
    function newRender(this: React.Component<any>) {
      const res = render.call(this);

      if (isValidElement(res) && res.type === "div") {
        const typingUsers = Object.keys(this.props.typingUsers);

        const index = typingUsers.indexOf(UserStore.getCurrentUser().id);
        if (index !== -1) {
          typingUsers.splice(index, 1);
        }

        if (!typingUsers.length) return res;

        const indicator = <TypingIndicator typingUsers={typingUsers} guildId={this.props.guildId} channelId={this.props.channel.id} isPopout={false} />;
        if (indicator) res.props.children[0].props.children[1] = indicator;
      }

      return res;
    }

    newRender.__vx__ = true;

    component.render = newRender;
  }
});
