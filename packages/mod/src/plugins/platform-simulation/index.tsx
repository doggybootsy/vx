import {definePlugin} from "../index";
import {Developers} from "../../constants";
import {getLazyStore, getProxyStore, getStore, whenWebpackInit, whenWebpackReady} from "@webpack";
import {Logger} from "vx:logger";
import {Injector} from "../../patcher";
import {GatewayRequestTypes} from "./settings/types"
import {settings} from "./settings";
import {Utils} from "./settings/utils";
import Types from "./settings/types";
import UI from "./settings/UI";
const Gateway = getProxyStore("GatewayConnectionStore")
export const PluginLogger = new Logger("GatewayPluginLogger");
export const PluginInjector = new Injector()

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start(signal: AbortSignal) {
        await whenWebpackInit()
        PluginInjector.after(Gateway, "getSocket", (_args, res, yeah) => {
            const originalSend = yeah.send.bind(res);
            yeah.send = (...args: [number, Types.IdentityProps]) => {
                const [EventType, IdentityProps] = args;
                if (EventType !== GatewayRequestTypes.IDENTIFY) return originalSend(...args);
                IdentityProps.properties = Utils.getCurrentPlatformWebsocket();
                return originalSend(...args);
            };
        });
        UI();
    },
    settings: settings,
    stop()
    {
        PluginInjector.unpatchAll()
    }
})