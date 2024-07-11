import { Messages } from "vx:i18n";
import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { getProxyByKeys, getProxyStore } from "@webpack";
import { useStateFromStores } from "@webpack/common";
import { useDiscordLocale } from "../../hooks";

const Components = getProxyByKeys([ "Heading", "Text" ]);

const RelationshipStore = getProxyStore("RelationshipStore");

function getCreatedAt(value: Date | string | number, lang?: string) {
  if (null == value || "" === value) return null;
  const data = new Date(value);
  return !(data instanceof Date) || isNaN(data.getTime()) ? null : data.toLocaleDateString(lang, {
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}

function FriendsSince({ userId, Section }: { userId: string, Section: React.ComponentType<React.PropsWithChildren<{ title: string }>> }) {  
  const local = useDiscordLocale(false);

  const since = useStateFromStores([ RelationshipStore ], () => {
    const since = RelationshipStore.getSince(userId);

    if (since && RelationshipStore.isFriend(userId)) return getCreatedAt(since, local);
    return null;
  }, [ local ]);

  if (!since) return null;

  return (
    <Section title={Messages.FRIENDS_SINCE}>
      <Components.Text variant="text-sm/normal">
        {since}
      </Components.Text>
    </Section>
  );
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: ".appsConnections,applicationRoleConnection",
    find: /\(0,.{1,3}\.jsx\)\((.{1,3}\.Z),{title:.{1,3}.Z.Messages.USER_PROFILE_MEMBER_SINCE,children:\(0,.{1,3}.jsx\)\(.{1,3}\..{1,3},{userId:(.{1,3})\.id,guildId:null==.{1,3}?void 0:.{1,3}.guildId,tooltipDelay:.{1,3}\..{1,3}}\)}\)/,
    replace: "$&,$enabled&&$jsx($self.FriendsSince,{Section:$1,userId:$2.id})"
  },
  FriendsSince: ErrorBoundary.wrap(FriendsSince)
});
