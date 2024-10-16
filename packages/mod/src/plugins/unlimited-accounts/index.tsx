import { definePlugin } from "vx:plugins";
import {Developers} from "../../constants";
import { Icons } from "../../components";

export default definePlugin({
    patches: {
        find: "5",
        match: "multiaccount_cta_tooltip_seen",
        replace: "Infinity"
    },
    icon: Icons.DiscordIcon.from("UserCircleIcon"),
    requiresRestart: true,
    authors: [Developers.kaan],
})