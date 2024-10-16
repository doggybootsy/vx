import { definePlugin } from "vx:plugins";
import {Developers} from "../../constants";
import {bySource, getLazy, getModule} from "@webpack";
import {Injector} from "../../patcher";

const i = new Injector();
export default definePlugin(
    {
        authors: [Developers.kaan],
        requiresRestart: false,
        async start() {
            const idleTimeout = getLazy(bySource("this._ref&&(clearTimeout(this._ref)"))
            const timeoutModule = await idleTimeout
            i.instead(timeoutModule.V7.prototype, "start", () => {
                return; // god I wish to make this better. this is SOOO bad.
            })
        },
        stop() {
            i.unpatchAll()
        }
    }
)