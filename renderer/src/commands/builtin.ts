import { addCommand } from ".";
import pluginManager from "renderer/addons/plugins";
import themeManager from "renderer/addons/themes";
import VXError from "renderer/error";
import native from "renderer/native";
import CustomCSS, { getCustomCSS } from "renderer/ui/customCSS";
import webpack from "renderer/webpack";
import { openWindow } from "renderer/window";
import { OptionType } from "renderer/commands/types";

const strToFeild = (item: string) => ({ name: item, value: item });

let uploadActions: {
  instantBatchUpload: Function
};

function instantBatchUpload(channelId: string, files: File[]) {
  if (!uploadActions) uploadActions = webpack.getModule<typeof uploadActions>(m => m.upload && m.instantBatchUpload)!;

  // Theres 2 'instantBatchUpload' one that uses 3 args and one that uses 1
  if (uploadActions.instantBatchUpload.length === 3) uploadActions.instantBatchUpload(channelId, files, false);
  else uploadActions.instantBatchUpload({
    channelId,
    files: files,
    draftType: 0,
    isThumbnail: false,
    isClip: false
  });
};

function sendBotMessage(channelId: string, content: string) {
  const messageActions = webpack.common.messageActions;
  if (!messageActions) throw new VXError(VXError.codes.NO_MESSAGE_ACTIONS);
  messageActions.sendBotMessage(channelId, content);
};

addCommand({
  name: "Custom CSS",
  options: [{
    type: OptionType.STRING,
    choices: [
      strToFeild("open"),
      strToFeild("send")
    ],
    name: "Action",
    required: true
  }],
  id: "internal/custom-css",
  execute([ action ], { channel }) {
    switch (action.value) {
      case "open":
        openWindow({ id: "vx/custom-css", title: "Custom CSS", render: CustomCSS });
        break;
      case "send":
        instantBatchUpload(channel.id, [
          new File([
            getCustomCSS()
          ], "custom-css.css", {
            type: "application/css"
          })
        ]);
        break;
      default:
        sendBotMessage(channel.id, `Action \`${action.value}\` is unknown!`);
        break;
    }
  }
})

function addAddonCommand(type: "plugins" | "themes", addonManager: typeof themeManager | typeof pluginManager) {
  addCommand({
    name: type === "plugins" ? "Plugins" : "Themes",
    options: [{
      type: OptionType.STRING,
      get choices() {
        return addonManager.getAll().map((addon) => ({
          name: addon.meta.name || addon.id,
          value: addon.id
        }))
      },
      name: "id",
      required: true
    }, {
      type: OptionType.STRING,
      choices: [
        strToFeild("enable"),
        strToFeild("disable"),
        strToFeild("toggle"),
        strToFeild("send")
      ],
      name: "action",
      required: true
    }],
    id: `internal/${type}`,
    execute([ $addon, action ], { channel }) {
      const addon = addonManager.get($addon.value)!;

      switch (action.value) {
        case "enable":
          addon.enable();
          sendBotMessage(channel.id, `Enabled ${addon.meta.name ? addon.meta.name : addon.id}`);
          break;
        case "toggle":
          addon.toggle();
          sendBotMessage(channel.id, `${!addon.enabled ? "Disabled" : "Enabled"} ${addon.meta.name ? addon.meta.name : addon.id}`);
          break;
        case "disable":
          addon.disable();
          sendBotMessage(channel.id, `Disabled ${addon.meta.name ? addon.meta.name : addon.id}`);
          break;
        case "send":
          instantBatchUpload(channel.id, [
            new File([ addon.contents ], addon.id)
          ]);
          break;
      
        default: 
          sendBotMessage(channel.id, `Action \`${action}\` is unknown!`);
          break;
      }
    }
  });
};
addAddonCommand("themes", themeManager);
addAddonCommand("plugins", pluginManager);

addCommand({
  name: "Quit",
  description: "Quit Discord",
  options: [{
    type: OptionType.BOOLEAN,
    name: "Restart",
    description: "Instead of quiting discord, do you want't to restart?"
  }],
  id: "internal/quit",
  execute([ restart ]) {
    const shouldRestart = restart ? restart.value : false;
    native.quit(shouldRestart);
  }
});