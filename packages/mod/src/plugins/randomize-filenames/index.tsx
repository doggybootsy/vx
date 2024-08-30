import { getLazyByKeys } from "@webpack";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { createAbort, getRandomItem } from "../../util";
import { Injector } from "../../patcher";
import { createSettings, SettingType } from "../settings";
import { Button, Flex, Icons, SystemDesign } from "../../components";

const DEFAULT_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

const settings = createSettings("randomize-filenames", {
  timestamp: {
    type: SettingType.SWITCH,
    default: false,
    title: "Use TimeStamp",
    description: "Uses the current utc timestamp"
  },
  characters: {
    type: SettingType.CUSTOM,
    default: DEFAULT_CHARACTERS,
    render(props) {
      return (
        <div>
          <div>
            Characters
          </div>
          <Flex>
            <Flex.Child grow={1}>
              <div>
                <SystemDesign.TextInput 
                  minLength={1}
                  disabled={settings.timestamp.get()}
                  value={props.state}
                  onChange={(value: string) => props.setState(value)}
                />
              </div>
            </Flex.Child>
            <Flex.Child grow={0} shrink={0} onClick={() => props.setState(DEFAULT_CHARACTERS)}>
              <Button size={Button.Sizes.ICON}>
                <Icons.Refresh />
              </Button>
            </Flex.Child>
          </Flex>
        </div>
      )
    }
  },
  format: {
    type: SettingType.CUSTOM,
    default: "%n.%e",
    render(props) {
      return (
        <div>
          <div>
            Format
          </div>
          <Flex>
            <Flex.Child grow={1}>
              <div>
                <SystemDesign.TextInput 
                  minLength={1}
                  value={props.state}
                  onChange={(value: string) => props.setState(value)}
                />
              </div>
            </Flex.Child>
            <Flex.Child grow={0} shrink={0} onClick={() => props.setState("%n.%e")}>
              <Button size={Button.Sizes.ICON}>
                <Icons.Refresh />
              </Button>
            </Flex.Child>
          </Flex>
        </div>
      )
    }
  }
});

function randomizeName(filename: string) {
  const spl = filename.split(".");
  
  const format = settings.format.get();

  let addPeriod = false;
  const mExt = /(\.?)%e/.exec(format);
  if (mExt && mExt[1]) addPeriod = true;

  const ext = spl.length === 1 ? "" : `${addPeriod ? "." : ""}${spl.at(-1)}`;

  if (settings.timestamp.get()) {
    return format.replace("%n", new Date().toUTCString()).replace(/(\.?)%e/, ext);
  }

  let name = "";
  const chars = [ ...settings.characters.get() ];
  
  for (let index = 0; index < (filename.length - ext.length); index++) {
    name += getRandomItem(chars);
  }

  return format.replace("%n", name).replace(/(\.?)%e/, ext);
}

const injector = new Injector();

const uploadActions = getLazyByKeys<{
  uploadFiles: (msg: { uploads: { filename: string }[] }) => any
}>([ "uploadFiles" ]);

const [ abort, getSignal ] = createAbort();

export default definePlugin({ 
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  settings,
  async start() {
    const signal = getSignal();

    const module = await uploadActions;
    if (signal.aborted) return;

    injector.before(module, "uploadFiles", (that, [ { uploads } ]) => {
      for (const upload of uploads) {
        upload.filename = randomizeName(upload.filename);
      }
    });
  },
  stop() {
    abort();
    injector.unpatchAll();
  }
});