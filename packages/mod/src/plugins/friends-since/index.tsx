import { Messages } from "@i18n";
import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";
import { getProxyByKeys, getProxyByStrings, getProxyStore } from "../../webpack";
import { useStateFromStores } from "../../webpack/common";

const Components = getProxyByKeys([ "Heading", "Text" ]);
const Section = getProxyByStrings<React.FunctionComponent<{ children: React.ReactNode }>>([ ",lastSection:", ".lastSection]:" ]);

const sectionClasses = getProxyByKeys([ "body", "title", "clydeMoreInfo" ]);
const classes = getProxyByKeys([ "memberSinceContainer", "discordIcon" ]);

const userProfileUtils = getProxyByKeys<{
  getCreatedAtDate(timeStamp: number | string | Date): string
}>([ "getCreatedAtDate" ]);

const RelationshipStore = getProxyStore("RelationshipStore");

function FriendsSince({ userId, headingClassName, textClassName }: { userId: string, headingClassName: string, textClassName: string }) {
  const since = useStateFromStores([ RelationshipStore ], () => {
    const since = RelationshipStore.getSince(userId);

    if (since) return userProfileUtils.getCreatedAtDate(since);
    return null;
  });

  if (!since) return null;

  return (
    <>
      <Components.Heading variant="eyebrow" className={headingClassName}>
        {Messages.FRIENDS_SINCE}
      </Components.Heading>
      <div className={classes.memberSinceContainer}>
        <Components.Text variant="text-sm/normal" className={textClassName}>
          {since}
        </Components.Text>
      </div>
    </>
  );
};

function FriendsSinceSection({ userId }: { userId: string }) {
  return (
    <Section>
      <FriendsSince userId={userId} headingClassName={sectionClasses.title} textClassName={sectionClasses.body} />
    </Section>
  )
};

export default definePlugin({
  name: () => Messages.FRIENDS_SINCE_NAME,
  description: () => Messages.FRIENDS_SINCE_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      match: "isUsingGuildBio:null",
      find: /\(0,.{1,3}\.jsx\)\(.{1,3}\.default,{userId:(.{1,3}\.id),guild:.{1,3},guildMember:.{1,3}}\)/,
      replace: "$&,$enabled&&$react.createElement($self.FriendsSinceSection,{userId:$1})"
    },
    {
      match: ".ConnectedUserAccounts,",
      find: /\(0,.{1,3}\.jsx\)\(.{1,3}\.default,({userId:.{1,3}\.id,headingClassName:.{1,3}\.userInfoSectionHeader,textClassName:.{1,3}\.userInfoText})\)/,
      replace: "$&,$enabled&&$react.createElement($self.FriendsSince,$1)"
    }
  ],
  FriendsSinceSection: ErrorBoundary.wrap(FriendsSinceSection),
  FriendsSince: ErrorBoundary.wrap(FriendsSince)
});
