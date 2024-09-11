import {definePlugin} from "../index";
import {Developers} from "../../constants";
import {MenuComponents, patch} from "../../api/menu";
import {NavigationUtils} from "@webpack/common";
import {SelectedChannelStore} from "@webpack/common"

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    start() {
        patch("first-message","textarea-context",(res,props) => {
            props.props.children.push(
                <MenuComponents.MenuItem id={"first-message"} label={"Jump to First Message"} action={() => {NavigationUtils.transitionToGuild(null, SelectedChannelStore.getChannelId(), "0")}}/>
            )
        })
    }
})