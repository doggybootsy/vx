import { bySource, byStrings, getLazy, getMangledProxy, getProxy } from "@webpack";
import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { className, createAbort, focusStore } from "../../util";
import { PassedChildrenProps, TooltipProps, UserPopout } from "../../components";
import { cloneElement, isValidElement, useMemo, useState } from "react";
import { ChannelStore, GuildMemberStore, UserStore, useStateFromStores } from "@webpack/common";
import { useInternalStore } from "../../hooks";
import * as styler from "./index.css?managed";
import { createSettings, SettingType } from "vx:plugins/settings";

const settings = createSettings("better-mentions", {
  clickableMentions: {
    type: SettingType.SWITCH,
    title: "Clickable Mentions",
    description: "Allows you to click mentions in the textarea to open the user popout",
    default: true
  },
  showAvatars: {
    type: SettingType.SWITCH,
    title: "Show Avatars",
    description: "Shows the avatar in the mention",
    default: true
  },
  roleColor: {
    type: SettingType.SWITCH,
    title: "Role Color",
    description: "Makes the mentions use the role color",
    default: true,
    props: { hideBorder: true }
  }
});

const TextareaMarkdownComponents = getMangledProxy<{
  Mention: (props: { id: string, guildId: string, channelId: string }) => React.ReactNode
}>("YV4F/v", {
  Mention: byStrings(".hidePersonalInformation", "#", "<@", ".discriminator")
});

const textareaMarkdownComponentsSearch = getLazy(bySource("YV4F/v"));
const avatarModule = getProxy((m) => m.default?.getUserAvatarURL);

const patcher = new Injector();

const [ abort, getSignal ] = createAbort();

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  settings,
  patches: {
    match: 'location:"UserMention",',
    find: /\((.{1,3}\..{1,3}),({className:.{1,3},onContextMenu:.+?children:"@".concat\(null!=.{1,3}\?.{1,3}:.{1,3}?\)})\)/,
    replace: "($self.mention,{parentProps:arguments[0],enabled:()=>$enabled,original:$1,props:$2})"
  },
  mention({ parentProps, enabled, original, props }: { parentProps: { userId: string, channelId: string }, enabled: () => boolean, original: (props: any) => JSX.Element, props: any }) {
    const showAvatar = settings.showAvatars.use();
    const roleColor = settings.roleColor.use();

    const user = useStateFromStores([ UserStore ], () => UserStore.getUser(parentProps.userId))
    const hasFocus = useInternalStore(focusStore, () => focusStore.hasFocus);

    const guildId = useMemo(() => ChannelStore.getChannel(parentProps.channelId).guild_id, [ ]);

    const member = useStateFromStores([ GuildMemberStore ], () => GuildMemberStore.getMember(guildId, parentProps.userId));

    const { color, colorString } = useMemo(() => {
      if (!member?.colorString) return {};
      return { colorString: member.colorString, color: parseInt(member.colorString.slice(1), 16) }
    }, [ member ]);

    const avatar = useMemo(() => {
      if (user) return user.getAvatarURL(guildId, null, hasFocus);
      return avatarModule.default.getUserAvatarURL(parentProps.userId) as string;
    }, [ user, hasFocus ]);

    props.className = className([ props.className, "vx-bm", "vx-bm-chat" ]);

    props["data-vx-bm-has-avatar"] = String(showAvatar);

    if (typeof member?.colorString === "string" && roleColor) {
      props.color = color;
      props.colorString = colorString;
    }

    if (showAvatar && enabled() && typeof props.children === "string") {
      props.children = [
        <img 
          src={avatar}
          className="vx-bm-avatar"
        />,
        props.children
      ]
    }
    
    return original.call(null, props);
  },
  async start() {
    const signal = getSignal();
    await textareaMarkdownComponentsSearch;
    if (signal.aborted) return;

    patcher.after(TextareaMarkdownComponents, "Mention", (that, [ props ], res) => {      
      const [ shouldShow, setShouldShow ] = useState(false);
      const user = useStateFromStores([ UserStore ], () => UserStore.getUser(props.id));
      const hasFocus = useInternalStore(focusStore, () => focusStore.hasFocus);

      const showAvatar = settings.showAvatars.use();
      const clickableMentions = settings.clickableMentions.use();      
      const roleColor = settings.roleColor.use();

      const member = useStateFromStores([ GuildMemberStore ], () => GuildMemberStore.getMember(props.guildId, props.id));

      const decimal = useMemo(() => member?.colorString && parseInt(member.colorString.slice(1), 16), [ member ]);

      if (!isValidElement(res)) return;
      if (!res.props.text) return;
      if (!props.id) return;      
      
      const clone = cloneElement(res as React.ReactElement<TooltipProps>, {
        shouldShow: !shouldShow,
        children(tProps: PassedChildrenProps) {
          return (
            <UserPopout
              shouldShow={clickableMentions ? shouldShow : false}
              user={props.id}
              channelId={props.channelId}
              guildId={props.guildId}
              onRequestClose={() => setShouldShow(false)}
              position="top"
            >
              {(pProps) => {
                const child = res.props.children({
                  ...tProps,
                  ...pProps,
                  onClick(event: any) {
                    pProps.onClick.call(this, event);
                    tProps.onClick.call(this);
                    setShouldShow((shouldShow) => clickableMentions ? !shouldShow : false);
                  }
                });

                if (roleColor && typeof decimal === "number") {
                  child.props.children.props.color = decimal;
                  child.props.children.props.colorString = member.colorString;
                }
                
                child.props.className = className([ child.props.className, "vx-bm", "vx-bm-textarea" ]);

                child.props["data-vx-bm-has-avatar"] = String(showAvatar);                

                if (showAvatar && typeof child.props.children.props.children === "string") {
                  child.props.children.props.children = [
                    <img 
                      className="vx-bm-avatar"
                      src={user.getAvatarURL(props.guildId, null, hasFocus)}
                    />,
                    child.props.children.props.children
                  ];
                }
                
                return child;
              }}
            </UserPopout>
          )
        }
      });

      return patcher.return(clone)
    });
  },
  stop() {
    abort();
    patcher.unpatchAll();
  }
});