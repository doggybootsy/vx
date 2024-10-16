import { Messages } from "vx:i18n";
import { addCommand } from ".";
import { pluginStore } from "../../addons/plugins";
import { themeStore } from "../../addons/themes";
import { plugins } from "vx:plugins";
import { openConfirmModal } from "../modals";
import { OptionType } from "./types";
import { instantBatchUpload } from "@webpack/common";
import { sendVXSystemMessage } from "../../util";
import { env, git, IS_DESKTOP } from "vx:self";

const $ = (choices: string[]) => choices.map((choice) => ({ name: choice, value: choice }));

addCommand({
  id: "internal/addon-manager/themes",
  name: "themes",
  options: [
    {
      type: OptionType.STRING,
      name: "action",
      required: true,
      choices: $([ "delete", "disable", "enable", "toggle", "send" ])
    },
    {
      type: OptionType.STRING,
      name: "theme",
      required: true,
      get choices() {        
        return themeStore.keys().map(m => ({ name: themeStore.getAddonName(m), value: m })) 
      }
    }
  ],
  execute([ action, theme ], { channel }) {
    switch (action.value) {
      case "delete": {
        openConfirmModal("Are you sure?", [
          `Are you sure you want to delete \`${themeStore.getAddonName(theme.value)}\` (\`${theme.value}\`)`,
          "You cannot recover deleted Themes"
        ], {
          confirmText: "Delete",
          danger: true,
          onConfirm() {
            themeStore.delete(theme.value);
          }
        });
        break;
      }
      case "disable": {
        themeStore.disable(theme.value);
        break;
      }
      case "enable": {
        themeStore.enable(theme.value);
        break;
      }
      case "toggle": {
        themeStore.toggle(theme.value);
        break;
      }
      case "send": {
        instantBatchUpload(channel.id, [
          new File([ themeStore.getCSS(theme.value) ], theme.value)
        ]);
        
        break;
      }
    
      default:
        break;
    }
  }
});

addCommand({
  id: "internal/addon-manager/plugins",
  name: "plugins",
  options: [
    {
      type: OptionType.STRING,
      name: "action",
      required: true,
      choices: $([ "delete", "disable", "enable", "toggle", "send" ])
    },
    {
      type: OptionType.STRING,
      name: "plugin",
      required: true,
      get choices() {
        const internalPluginIds: [ any, Uppercase<string> ][] = Object.values(plugins).map((plugin) => [ 
          plugin, 
          `${plugin.id.replace(".app", "").replace(".web", "").replace(/-/g, "_").toUpperCase()}_NAME` as Uppercase<string> 
        ]);

        return [
          ...internalPluginIds.map(([ id, key ]) => ({ name: Messages[key], value: id })),
          ...pluginStore.keys().map(m => ({ name: pluginStore.getAddonName(m), value: m }))
        ];
      }
    }
  ],
  execute([ action, plugin ], { channel }) {
    const isInternal = typeof plugin.value === "object";    

    switch (action.value) {
      case "delete": {
        if (isInternal) {
          sendVXSystemMessage(channel.id, "You cannot delete a internal plugin!");
          break;
        }

        openConfirmModal("Are you sure?", [
          `Are you sure you want to delete \`${pluginStore.getAddonName(plugin.value)}\` (\`${plugin.value}\`)`,
          "You cannot recover deleted plugins"
        ], {
          confirmText: "Delete",
          danger: true,
          onConfirm() {
            pluginStore.delete(plugin.value);
          }
        });
        break;
      }
      case "disable": {
        if (isInternal) plugin.value.disable();
        else pluginStore.disable(plugin.value);

        break;
      }
      case "enable": {
        if (isInternal) plugin.value.enable();
        else pluginStore.enable(plugin.value);

        break;
      }
      case "toggle": {
        if (isInternal) plugin.value.toggle();
        else pluginStore.toggle(plugin.value);

        break;
      }
      case "send": {
        if (isInternal) {
          sendVXSystemMessage(channel.id, "You cannot send a internal plugin!");
          break;
        }

        instantBatchUpload(channel.id, [
          new File([ pluginStore.getJS(plugin.value) ], plugin.value)
        ]);
        
        break;
      }
    
      default:
        break;
    }
  }
});

addCommand({
  id: "internal/debug",
  name: "debug",
  description: "Sends a message with some debug info",
  async execute(options, { channel }) {
    const info: BlobPart[] = [];

    info.push(`VX v${env.VERSION}${env.IS_DEV ? " (dev)" : ""} ${git.exists ? `git(url: ${git.url}, hash: ${git.hash})` : "git(exists: false)"} desktop(${IS_DESKTOP})\n`);
    info.push(`discord release(${(window as any).GLOBAL_ENV.RELEASE_CHANNEL})\n`);
    info.push(`\n`);
    info.push(`internal plugins: ${Object.values(plugins).map((plugin) => `${plugin.id}(${plugin.isEnabled()})`).join(" ")}\n`);
    info.push(`plugins: ${pluginStore.keys().map((plugin) => `${plugin}(${pluginStore.isEnabled(plugin)})`).join(" ")}\n`);
    info.push(`themes: ${themeStore.keys().map((theme) => `${theme}(${themeStore.isEnabled(theme)})`).join(" ")}\n`);

    instantBatchUpload(channel.id, [ new File(info, "debug.txt") ]);
  }
});

addCommand({
  id: "internal/spotify-volume",
  name: "spotify-volume",
  description: "Sets the spotify embed volume",
  predicate: () => IS_DESKTOP,
  options: [
    {
      type: OptionType.INTEGER,
      name: "percent",
      maxValue: 100,
      minValue: 0,
      choices: Array.from({ length: 101 }, (v, i) => ({ name: `${i}%`, value: i / 100 }))
    }
  ],
  execute([ percent ], { channel }) {
    if (percent) {
      window.VXNative!.spotify.setVolume(percent.value);
    }
  
    sendVXSystemMessage(channel.id, `Spotify volume is set to ${(percent ? percent.value : window.VXNative!.spotify.getVolume()) * 100}%`);
  }
})