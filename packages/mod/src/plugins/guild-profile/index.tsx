import { definePlugin } from "..";
import { MenuComponents } from "../../api/menu";
import { ModalComponents, openModal, openUserModal } from "../../api/modals";
import { Developers } from "../../constants";
import { fetchUser, GuildMemberStore, GuildStore, RelationshipStore, UserStore, useStateFromStores } from "@webpack/common";
import * as styler from "./index.css?managed";
import { useDeferredValue, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { byStrings, getMangledProxy, getModule, getProxy, getProxyByKeys, getProxyByStrings, getProxyStore } from "@webpack";
import { Messages } from "vx:i18n";
import { Guild } from "discord-types/general";
import { focusStore, InternalStore, proxyCache } from "../../util";
import { useInternalStore } from "../../hooks";
import { Markdown } from "../../components";

const GuildMemberCountStore = getProxyStore("GuildMemberCountStore");

const quantize = getMangledProxy<{
  quantize(img: HTMLImageElement, sampleSize: number, pixelSkip: number): [ r: number, g: number, b: number ][]
}>("[[0,0,0]]", {
  quantize: byStrings(".getImageData(0,0,")
});

const cache: Record<string, any> = {};

const DEFAULT_COLOR: [ r: number, g: number, b: number ][] = [[ 0, 0, 0 ]];
async function getBannerColor(guildIcon?: string): Promise<[ r: number, g: number, b: number ][]> {
  if (!guildIcon) return DEFAULT_COLOR;

  return cache[guildIcon] ??= new Promise((resolve, reject) => {
    let img: HTMLImageElement | null = new Image();

    img.crossOrigin = "Anonymous",
    img.onerror = e=>{
      reject(e);
      img!.onerror = img!.onload = null,
      img = null;
    }
    ,
    img.onload = ()=>{
      resolve(quantize.quantize(img!, 5, 10));
      img!.onerror = img!.onload = null,
      img = null;
    }
    ,
    img.src = guildIcon;
  });
}

const enum Tabs {
  ABOUT, FRIENDS, BLOCKED
}

function dateToNode(value: Date | string | number, lang?: string) {
  if (null == value || "" === value) return null;
  const data = new Date(value);
  return !(data instanceof Date) || isNaN(data.getTime()) ? null : data.toLocaleDateString(lang, {
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}

const Section = getProxyByStrings<React.FunctionComponent<React.PropsWithChildren<{
  heading: React.ReactNode, subheading?: React.ReactNode, className?: string, scrollIntoView?: boolean, headingColor?: string
}>>>([ "cancelAnimationFrame(", "text-xs/semibold", ".useReducedMotion)" ]);

const snowflakeUtils = getProxyByKeys([ "extractTimestamp" ]);

function AboutTab({ guild }: { guild: Guild }) {
  return (
    <>
      <Section heading="Server Owner">
        <UserItem guildId={guild.id} userId={guild.ownerId} />
      </Section>
      <Section heading="Created At">
        <span className="vx-gp-section">{dateToNode(snowflakeUtils.extractTimestamp(guild.id))}</span>
      </Section>
      {guild.vanityURLCode && (
        <Section heading="Created At">
          <Markdown text={`https://discord.gg/${guild.vanityURLCode}`} />
        </Section>
      )}
      <Section heading="Join At">
        <span className="vx-gp-section">{dateToNode(guild.joinedAt)}</span>
      </Section>
      <Section heading="Verification Level">
        <span className="vx-gp-section">{guild.verificationLevel}</span>
      </Section>
      <Section heading="Explicit Media Content Filter">
        <span className="vx-gp-section">{guild.explicitContentFilter}</span>
      </Section>
      <Section heading="Server Boost Count">
        <span className="vx-gp-section">{guild.premiumSubscriberCount}</span>
      </Section>
      <Section heading="Server boost Level">
        <span className="vx-gp-section">{guild.premiumTier}</span>
      </Section>
      <Section heading="Prefered Locale">
        <span className="vx-gp-section">{guild.preferredLocale}</span>
      </Section>
      <Section heading="NSFW Level">
        <span className="vx-gp-section">{guild.nsfwLevel}</span>
      </Section>
    </>
  );
}

class InCommonStore extends InternalStore {
  #request = getProxyByKeys([ "requestMembersById" ]);
  private requestMembersById(guildIds: string[] | string, userIds: string[] | string) {
    this.#request.requestMembersById(guildIds, userIds, false);
  }

  public async requestFriendIds(guildId: string) {
    this.requestMembersById(guildId, RelationshipStore.getFriendIDs());
  }
  public useFriendIds(guildId: string) {
    useLayoutEffect(() => {
      this.requestFriendIds(guildId);
    }, [ ]);

    return useStateFromStores([ GuildMemberStore, RelationshipStore ], () => (
      GuildMemberStore.getMemberIds(guildId).filter(id => RelationshipStore.isFriend(id))
    ));
  }

  public async requestBlockedIds(guildId: string) {
    this.requestMembersById(guildId, RelationshipStore.getBlockedIDs());
  }
  public useBlockedIds(guildId: string) {
    useLayoutEffect(() => {
      this.requestBlockedIds(guildId);
    }, [ ]);

    return useStateFromStores([ GuildMemberStore, RelationshipStore ], () => (
      GuildMemberStore.getMemberIds(guildId).filter(id => RelationshipStore.isBlocked(id))
    ));
  }
}

const inCommonStore = new InCommonStore();

function UserItem({ userId, guildId }: { userId: string, guildId: string }) {
  const user = useStateFromStores([ UserStore ], () => UserStore.getUser(userId));
  const member = useStateFromStores([ GuildMemberStore ], () => GuildMemberStore.getMember(guildId, userId));
  const friendNickName = useStateFromStores([ RelationshipStore ], () => RelationshipStore.isFriend(userId) && RelationshipStore.getNickname(userId));

  useLayoutEffect(() => {
    if (!user) fetchUser(userId);
  }, [ ]);

  const hasNickname = useMemo(() => !!friendNickName || !!member?.nick, [ user, member ]);
  const hasFocus = useInternalStore(focusStore, () => focusStore.hasFocus);

  if (!user || !member) {
    return (
      <div>
        {userId} loading...
      </div>
    )
  }

  return (
    <div className="vx-gp-user" onClick={() => openUserModal(userId)}>
      <div 
        className="vx-gp-user-avatar" 
        style={{ backgroundImage: `url(${user.getAvatarURL(guildId, 60, hasFocus)})` }} 
      />
      <div className="vx-gp-user-info">
        <div className="vx-gp-user-title">{member.nick || friendNickName || (user as any).globalName || user.username}</div>
        {hasNickname && (
          <div className="vx-gp-user-sub">{(user as any).globalName || user.username}</div>
        )}
      </div>
    </div>
  )
}

function FriendsTab({ guild }: { guild: Guild }) {
  const ids =  inCommonStore.useFriendIds(guild.id);
  
  return (
    <div className="vx-gp-users">
      {ids.length ? (
        ids.map((userId) => (
          <UserItem key={userId} userId={userId} guildId={guild.id} />
        ))
      ) : (
        <div
          style={{
            flex: "0 1 auto",
            width: 433,
            height: 232,
            backgroundImage: "url(/assets/99ad5845cf7de1c326e2.svg)",
            margin: "auto"
          }}
        />
      )}
    </div>
  )
}
function BlockedTab({ guild }: { guild: Guild }) {
  const ids =  inCommonStore.useBlockedIds(guild.id);
  
  return (
    <div className="vx-gp-users">
      {ids.length ? (
        ids.map((userId) => (
          <UserItem key={userId} userId={userId} guildId={guild.id} />
        ))
      ) : (
        <div
          style={{
            flex: "0 1 auto",
            width: 433,
            height: 232,
            backgroundImage: "url(/assets/99ad5845cf7de1c326e2.svg)",
            margin: "auto"
          }}
        />
      )}
    </div>
  )
}

function GuildProfile({ guildId, transitionState, onClose }: { guildId: string, transitionState: any, onClose(): void }) {
  const id = useId();
  const [ tab, setTab ] = useState(Tabs.ABOUT);
  const ref = useRef<HTMLDivElement>(null);

  const { guild, icon, banner } = useStateFromStores([ GuildStore ], () => {
    const guild = GuildStore.getGuild(guildId);

    return {
      guild,
      icon: guild.getIconURL(200, true),
      banner: guild.banner ? `https://cdn.discordapp.com/banners/${guildId}/${guild.banner}.${guild.banner.startsWith("a_") ? "gif" : "webp"}?size=480` : null
    }
  });

  const [ bannerColor, setBannerColor ] = useState(DEFAULT_COLOR[0]);
  useLayoutEffect(() => {
    const controller = new AbortController();
    
    getBannerColor(icon).then((color) => {
      if (controller.signal.aborted) return;
      setBannerColor(color[0]);
    });

    return () => controller.abort();
  }, [ icon ]);

  const bannerHeight = useMemo(() => banner ? 338 : 210, [ banner ]);
  
  const bannerStyles = useMemo(() => {
    const bannerStyles: React.CSSProperties = {
      backgroundColor: `rgb(${bannerColor.join(", ")})`
    }
  
    if (banner) {
      bannerStyles.backgroundImage = `url(${banner})`;
    }

    return bannerStyles;
  }, [ banner, bannerColor ]);
  
  return (
    <ModalComponents.Root transitionState={transitionState} size={ModalComponents.Size.SMALL} hideShadow className="vx-gp-root">
      <div className="vx-gp-modal" style={{ "--banner-height": `${bannerHeight}px` }}>
        <header data-has-banner={Boolean(banner).toString()}>
          <svg viewBox={`0 0 600 ${bannerHeight}`} style={{ minHeight: bannerHeight, width: 600 }}>
            <mask id={`${id}-${guildId}`}>
              <rect x={0} y={0} width="100%" height="100%" fill="white" />
              <circle cx={84} cy={bannerHeight - 5} r={68} fill="black" />
            </mask>
            <foreignObject x="0" y="0" width="100%" height="100%" overflow="visible" mask={`url(#${id}-${guildId})`} >
              <div style={bannerStyles} className="vx-gp-banner" />
            </foreignObject>
          </svg>
          <div className="vx-gp-icon">
            {icon ? (
              <img src={icon} height={120} width={120} />
            ) : (
              <div>
                {guild.acronym}
              </div>
            )}
          </div>
        </header>
        <div className="vx-gp-body">
          <div className="vx-gp-info">
            <div className="vx-gp-name">
              {guild.name}
            </div>
            {/* <div className="vx-gp-stats">
              <div>
                <span />
                <span>{memberCount}</span>
              </div>
              <div>
                <span />
                <span>{onlineCount}</span>
              </div>
            </div> */}
          </div>
          <div className="vx-gp-content" data-tab-id={tab.toString()}>
            <div className="vx-gp-tabs">
              <div 
                className="vx-gp-tab" 
                tabIndex={0} 
                aria-selected={tab === Tabs.ABOUT} 
                aria-controls="about-tab"
                onClick={() => {
                  setTab(Tabs.ABOUT);
                  ref.current?.scrollTo(0, 0);
                }}
              >
                {Messages.ABOUT}
              </div>
              <div 
                className="vx-gp-tab" 
                tabIndex={0} 
                aria-selected={tab === Tabs.FRIENDS} 
                aria-controls="friends-tab"
                onClick={() => {
                  setTab(Tabs.FRIENDS);
                  ref.current?.scrollTo(0, 0);
                }}
              >
                {Messages.FRIENDS}
              </div>
              <div 
                className="vx-gp-tab" 
                tabIndex={0} 
                aria-selected={tab === Tabs.BLOCKED} 
                aria-controls="blocked-tab"
                onClick={() => {
                  setTab(Tabs.BLOCKED);
                  ref.current?.scrollTo(0, 0);
                }}
              >
                {Messages.BLOCKED}
              </div>
            </div>
            <div className="vx-gp-page" ref={ref}>
              {tab === Tabs.ABOUT ? (
                <AboutTab guild={guild} />
              ) : tab === Tabs.FRIENDS ? (
                <FriendsTab guild={guild} />
              ) : (
                <BlockedTab guild={guild} />
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalComponents.Root>
  )
}

function openGuildProfileModal(guildId: string) {
  openModal((props) => <GuildProfile  guildId={guildId} {...props} />, { modalKey: `vx-guild-profile-${guildId}` });
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  menus: {
    "guild-context"(props, res) {
      res.props.children.unshift(
        <MenuComponents.MenuGroup>
          <MenuComponents.MenuItem 
            id="vx-guild-profile" 
            label="Guild Profile" 
            action={() => openGuildProfileModal(props.guild.id)}
          />
        </MenuComponents.MenuGroup>
      )
    }
  }
});
