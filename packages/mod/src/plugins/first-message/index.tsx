import {definePlugin} from "../index";
import {Developers} from "../../constants";
import {NavigationUtils} from "@webpack/common";
import {SelectedChannelStore} from "@webpack/common"
import {Channel, Guild} from "discord-types/general";

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    commands: {
        id: "first-message",
        name: "first-message",
        execute(options: any[], {channel, guild}: { channel: Channel; guild?: Guild }) {
            NavigationUtils.transitionToGuild(guild?.id ?? null, channel.id, "0")
        }
    },
})