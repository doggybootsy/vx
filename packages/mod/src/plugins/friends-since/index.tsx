import { Messages } from "vx:i18n";
import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { getProxyByKeys, getProxyByStrings, getProxyStore } from "@webpack";
import { useStateFromStores } from "@webpack/common";

const Components = getProxyByKeys([ "Heading", "Text" ]);
const Section = getProxyByStrings<React.FunctionComponent<{ children: React.ReactNode }>>([ ",lastSection:", ".lastSection]:" ]);

const sectionClasses = getProxyByKeys([ "body", "title", "clydeMoreInfo" ]);

const userProfileUtils = getProxyByKeys<{
  getCreatedAtDate(timeStamp: number | string | Date): string
}>([ "getCreatedAtDate" ]);

const RelationshipStore = getProxyStore("RelationshipStore");

function FriendsSince({ userId, headingClassName, textClassName }: { userId: string, headingClassName: string, textClassName: string }) {
  const since = useStateFromStores([ RelationshipStore ], () => {
    const since = RelationshipStore.getSince(userId);

    if (since && RelationshipStore.isFriend(userId)) return userProfileUtils.getCreatedAtDate(since);
    return null;
  });

  if (!since) return null;

  return (
    <div>
      <Components.Heading variant="eyebrow" className={headingClassName}>
        {Messages.FRIENDS_SINCE}
      </Components.Heading>
      <Components.Text variant="text-sm/normal" className={textClassName}>
        {since}
      </Components.Text>
    </div>
  )
}

function FriendsSinceSection({ userId }: { userId: string }) {  
  return (
    <Section>
      <FriendsSince userId={userId} headingClassName={sectionClasses.title} textClassName={sectionClasses.body} />
    </Section>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      identifier: "popout",
      match: "isUsingGuildBio:null",
      find: /\(0,.{1,3}\.jsx\)\(.{1,3}\.default,{user:(.{1,3}),guild:.{1,3},guildMember:.{1,3},showBorder:.+?}\),/,
      replace: "$enabled&&$jsx($self.FriendsSinceSection,{userId:$1.id}),$&"
    },
    {
      identifier: "modal",
      match: ".ConnectedUserAccounts,",
      find: /\(0,.{1,3}\.jsx\)\(.{1,3}\.default,({userId:.{1,3}\.id,headingClassName:.{1,3}\.userInfoSectionHeader,textClassName:.{1,3}\.userInfoText})\)/,
      replace: "$&,$enabled&&$jsx($self.FriendsSince,$1)"
    }
  ],
  FriendsSinceSection: ErrorBoundary.wrap(FriendsSinceSection),
  FriendsSince: ErrorBoundary.wrap(FriendsSince)
});
