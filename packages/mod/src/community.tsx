import { getLazyByKeys } from "@webpack";
import { CommunityAddonCard, themeCommunityStore } from "./dashboard/pages/community/themes";
import { useInternalStore } from "./hooks";
import { useMemo } from "react";
import { Spinner } from "./components";

const COMMUNITY_REGEX_SOURCE = "(?:https?:\\/\\/betterdiscord\\.app\\/theme|(?:betterdiscord|bd|bdapp):\\/\\/themes?)(?:\\/|\\?id=)(\\S+)";

const COMMUNITY_REGEX = new RegExp(`^(?:<${COMMUNITY_REGEX_SOURCE}>|${COMMUNITY_REGEX_SOURCE})`);

function CommunityCard({ id, children }: { id: string, children: React.ReactNode }) {
  const { addons, isLoading } = useInternalStore(themeCommunityStore, () => themeCommunityStore.getState());

  const addon = useMemo(() => {
    return addons.find((addon) => addon.name.toLowerCase() === id.toLowerCase() || String(addon.id) === id);
  }, [ addons ]);

  if (addon) return (
    <div className="vx-community-chat-card">
      <CommunityAddonCard addon={addon} />
    </div>
  )

  if (isLoading) return (
    <span
      className="vx-community-chat-loader"
      onClick={() => {
        let path = `/${id}`;
        
        if (!isNaN(Number(id))) path = `?id=${id}`;

        window.open(`https://betterdiscord.app/theme${path}`, "_blank", "noopener,noreferrer");
      }}
    >
      <Spinner type="lowMotion" />
      {children}
    </span>
  )
  
  return children;
}

getLazyByKeys([ "defaultRules", "parse" ]).then((SimpleMarkdownWrapper) => {
  SimpleMarkdownWrapper.defaultRules["community-themes"] = {
    order: 15,
    match(text: string, state: any) {      
      if (!(state.allowLinks && state.inline && !state.isCommunityThemesWrapped)) return null;
      return COMMUNITY_REGEX.exec(text);
    },
    parse([ link, id1, id2 ]: RegExpExecArray, parse: any, state: any) {
      const parseChildren = (text: string) => {
        state.isCommunityThemesWrapped = true;
        const children = parse(text, state);
        delete state.isCommunityThemesWrapped;

        return children;
      }

      if (link[0] === "<") return parseChildren(link.slice(1, -1));      

      return { type: "community-themes", id: id1 || id2, children: parseChildren(link) }
    },
    react({ id, children }: any, parse: any, state: any) {
      return <CommunityCard id={id} children={parse(children, state)} key={state.key} />
    }
  };
  
  SimpleMarkdownWrapper.parse = SimpleMarkdownWrapper.reactParserFor(SimpleMarkdownWrapper.defaultRules);
});