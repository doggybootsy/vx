import { isValidElement, useEffect, useMemo, useState } from "react";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { GuildMemberStore, UserStore, fetchUser, openUserContextMenu, useStateFromStores } from "@webpack/common";

import * as styler from "./index.css?managed";
import { Mask, Tooltip, UserPopout } from "../../components";
import { SettingType, createSettings } from "../settings";
import { getProxyByKeys } from "@webpack";
import { useInternalStore } from "../../hooks";
import { focusStore } from "../../util";
import { ListFormat } from "../../intl";
import { Messages } from "vx:i18n";

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
  }
});

const MAX_BUBBLES = 10;

const avatarModule = getProxyByKeys([ "getGuildMemberAvatarURLSimple" ]);

function TypingUser({ id, guildId, channelId, avatarOnly, isLast }: { id: string, guildId: string | null, channelId: string, avatarOnly?: true, isLast?: boolean }) {
  const [ shouldShow, setShouldShow ] = useState(false);

  const showAvatar = settings.avatars.use();
  const useRoleColor = settings.roleColor.use();

  const user = useStateFromStores([ UserStore ], () => UserStore.getUser(id));
  const member = useStateFromStores([ GuildMemberStore ], () => guildId ? GuildMemberStore.getMember(guildId, id) : null);
  const hasFocus = useInternalStore(focusStore, () => focusStore.hasFocus);

  // useEffect(() => {
  //   if (!user) fetchUser(id);
  // }, [ user ]);

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

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: ".default.Messages.ONE_USER_TYPING.format",
    find: /class .{1,3} extends .{1,3}\.PureComponent{componentDidMount\(\){.{1,3}?\..+constructor\(\.{3}.{1,3}\){super\(\.{3}.{1,3}\)/,
    replace: "$&,$enabled&&$self.patch(this)"
  },
  settings,
  styler,
  patch(component: React.Component) {
    if ((component.render as any).__vx__) return;

    const render = component.render;
    function newRender(this: React.Component<any>) {
      const res = render.call(this);

      if (isValidElement(res) && res.type === "div") {
        const typingUsers = Object.keys(this.props.typingUsers);

        if (!typingUsers.length) return res;

        if (settings.avatarOnly.get()) {
          if (typingUsers.length > 10) {
            const ids = typingUsers.slice(0, MAX_BUBBLES - 1);
            const extra = typingUsers.slice(MAX_BUBBLES - 1);

            res.props.children[0].props.children[1] = (
              <span className="vx-bti-users">
                {ids.map((id) => (
                  <TypingUser id={id} key={id} guildId={this.props.guildId} channelId={this.props.channelId} avatarOnly />
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
                {" are typing..."}
              </span>
            )
          }
          else {
            res.props.children[0].props.children[1] = (
              <span className="vx-bti-users">
                {typingUsers.map((id, index) => (
                  <TypingUser id={id} key={id} guildId={this.props.guildId} channelId={this.props.channelId} avatarOnly isLast={index === (typingUsers.length - 1)} />
                ))}
                {typingUsers.length === 1 ? " is typing..." : " are typing..."}
              </span>
            )
          }
        }
        else {
          switch (typingUsers.length) {
            case 1: {
              res.props.children[0].props.children[1] = (
                <span className="vx-bti-users">
                  <TypingUser id={typingUsers[0]} guildId={this.props.guildId} channelId={this.props.channel.id} />
                  {" is typing..."}
                </span>
              )
              break;
            }
            case 2:
            case 3: {
              res.props.children[0].props.children[1] = (
                <span className="vx-bti-users">
                  {formatter.formatToParts(typingUsers).map((part) => part.type === "literal" ? part.value : (
                    <TypingUser id={part.value} key={part.value} guildId={this.props.guildId} channelId={this.props.channel.id} />
                  ))}
                  {" are typing..."}
                </span>
              )
              break;
            }
          
            default: (
              res.props.children[0].props.children[1] = (
                <span className="vx-bti-users">
                  {Messages.SEVERAL_USERS_TYPING}
                </span>
              )
            )
          }
        }
        
        // res.props.children[0].props.children[1] = (
        //   <span className="vx-bti-users">
        //     {typingUsers.map((id, index) => (
        //       <>
        //         <TypingUser id={id} key={id} guildId={this.props.guildId} channelId={this.props.channel.id} />
        //         {index + 1 !== typingUsers.length && " and "}
        //       </>
        //     ))}
        //     {" is typing..."}
        //   </span>
        // )
      }

      return res;
    }

    newRender.__vx__ = true;

    component.render = newRender;
  }
});
