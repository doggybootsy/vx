import { env, git } from "self";
import { InternalStore } from "../../../util";
import { updater } from "../../../native";
import { compare } from "./semver";
import { Button, Flex, Icons } from "../../../components";
import { useInternalStore } from "../../../hooks";
import { WindowUtil } from "@webpack/common";
import { whenWebpackReady } from "@webpack";
import { openNotification } from "../../../api/notifications";
import { Messages } from "i18n";

// 3 mins
const DELAY_MIN = 1000 * 60 * 3;
// 30 mins
const DELAY_AUTO = DELAY_MIN * 10;

const updaterStore = new class extends InternalStore {
  constructor() {
    super();

    whenWebpackReady().then(() => {
      if (!env.IS_DEV && git.exists) this.checkForUpdates();
    });
  };

  displayName = "UpdaterStore";

  #lastFetch: Date | null = null;
  #compared: -1 | 0 | 1 | null = null;
  #release: Git.Release | null = null;
  #latest: string | null = null;
  #canCheck = true;
  #fetching = false;
  #timeoutId: ReturnType<typeof setTimeout> | null = null;

  async checkForUpdates() {
    if (!git.exists) return;

    if (this.#timeoutId) clearTimeout(this.#timeoutId);
    this.#timeoutId = setTimeout(() => this.checkForUpdates(), DELAY_AUTO);

    this.#lastFetch = new Date();
    this.#compared = null;
    this.#release = null;
    this.#latest = null;
    this.#canCheck = false;
    this.#fetching = true;

    this.emit();

    const release = await updater.getLatestRelease();

    const version = release.tag_name.replace(/v/i, "");
        
    const compared = compare(release.tag_name, env.VERSION);

    this.#compared = compared;
    this.#fetching = false;
    this.#release = release;
    this.#latest = version;

    this.emit();

    if (compared === -1) {
      openNotification({
        title: Messages.VX_UPDATE_AVAILABLE,
        id: "vx-update-available",
        icon: Icons.Logo,
        description: [
          Messages.DOWNLOAD_READY.format({ version: release.tag_name.replace("v", "") })
        ],
        duration: 15e3,
        footer: [
          <Button size={Button.Sizes.SMALL} grow onClick={() => this.download()}>
            {Messages.DOWNLOAD_NOW}
          </Button>
        ],
        type: "success"
      });
    }

    setTimeout(() => {
      this.#canCheck = true;
      this.emit();
    }, DELAY_MIN);
  };
  download() {
    if (this.#compared !== -1) return;
    updater.update(this.#release!);
  };

  getState() {
    return {
      lastFetch: this.#lastFetch,
      compared: this.#compared,
      canCheck: this.#canCheck,
      fetching: this.#fetching,
      release: this.#release,
      latest: this.#latest
    }
  }
};

export function Updater() {
  if (!git.exists) return null;

  const state = useInternalStore(updaterStore, () => updaterStore.getState());  

  return (
    <Flex className="vx-updater" justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
      <div className="vx-updater-info">
        <div className="vx-updater-notice">
          {
            typeof state.compared === "number" ? 
              state.compared === -1 ? Messages.VX_UPDATE_AVAILABLE : 
              state.compared === 0 ? Messages.UP_TO_DATE : Messages.ABOVE_LATEST_RELEASE : 
              Messages.UNKNOWN
          }
        </div>
        <div className="vx-updater-fetch">
          {Messages.LAST_CHECKED.format({ date: state.lastFetch ? state.lastFetch.toLocaleString() : "???" })}
        </div>
      </div>
      <Flex className="vx-updater-buttonrow" gap={6} align={Flex.Align.CENTER} justify={Flex.Justify.END}>
        <Button 
          disabled={state.lastFetch === null}
          size={Button.Sizes.ICON}
          look={Button.Looks.BLANK} 
          onClick={(event) => {
            if (!state.release) return;

            WindowUtil.handleClick({
              href: state.release.html_url
            }, event);
          }}
        >
          <Icons.Github />
        </Button>
        <Button
          onClick={() => {
            if (state.compared === -1) {
              updaterStore.download();  
              return;
            };
    
            updaterStore.checkForUpdates();
          }} 
          disabled={state.compared === -1 ? false : !state.canCheck}
        >
          {state.fetching ? Messages.FETCHING : state.compared === -1 ? Messages.UPDATE_TO.format({ version: state.release!.tag_name.replace("v", "") }) : Messages.CHECK_FOR_UPDATES}
        </Button>
      </Flex>
    </Flex>
  )
}