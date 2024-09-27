import { byStrings, getLazy } from "@webpack";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { Button, ErrorBoundary } from "../../components";
import { reviewDBStore } from "./store";
import { useInternalStore } from "../../hooks";
import * as styler from "./index.css?managed";
import { createSettings, CustomSettingType, SettingType } from "../settings";
import { ReviewDBPage } from "./review";
import { clipboard, createAbort } from "../../util";

export const settings = createSettings("review-db", {
  auth: {
    type: SettingType.CUSTOM,
    default: {},
    render() {
      const { hasAuth, token } = useInternalStore(reviewDBStore, () => {
        const hasAuth = reviewDBStore.hasAuth();

        return {
          hasAuth,
          token: hasAuth ? reviewDBStore.getAuthToken() : null
        }
      });
  
      return (
        <>
          <Button disabled={hasAuth} onClick={() => reviewDBStore.requestAuth()}>
            Sign In
          </Button>
          <Button disabled={!hasAuth} onClick={() => reviewDBStore.logout()}>
            Logout
          </Button>
          <Button disabled={!hasAuth} onClick={() => clipboard.copy(token!)}>
            Copy Token
          </Button>
        </>
      )
    }
  } as CustomSettingType<Record<string, string>>,
  showWarning: {
    type: SettingType.SWITCH,
    default: false,
    title: "Show Warning",
    description: "Display warning to be respectful to other users at the top of the review list"
  }
});

const [ abort, getSignal ] = createAbort();
const injector = new Injector();

const filter = byStrings(".id)).mutualGuilds)||void 0===", ".id)).mutualFriends)||void 0===", ".Messages.USER_PROFILE_ABOUT_ME");
const useUserModalSections = getLazy((m) => filter(m.default), { searchDefault: false });

const plugin = definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  patches: {
    match: ".section,subsection:void 0",
    find: /(let{section:(.{1,3}),subsection:.{1,3},.+?}=.{1,3};return) (\2===.{1,3}\..{1,3}\.ACTIVITY)/,
    replace: "$1 $2==='REVIEW_DB'?$jsx($self.ReviewDB,arguments[0]):$3"
  },
  settings,
  ReviewDB: ErrorBoundary.wrap(ReviewDBPage),
  async start() {
    const signal = getSignal();

    const module = await useUserModalSections;
    if (signal.aborted) return;

    injector.after(module, "default", (that, args, res: any) => {
      res.push({
        section: "REVIEW_DB",
        text: "Review DB"
      });
    });
  },
  stop() {
    injector.unpatchAll();
    abort();
  },
});