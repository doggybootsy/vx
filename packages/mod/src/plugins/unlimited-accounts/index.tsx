import {definePlugin} from "../index";
import {Developers} from "../../constants";

export default definePlugin({
    patches: {
        find: "5",
        match: "multiaccount_cta_tooltip_seen",
        replace: "Infinity"
    },
    requiresRestart: true,
    authors: [Developers.kaan],
})