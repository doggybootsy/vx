import {definePlugin} from "../index";
import {Developers} from "../../constants";
import {Injector} from "../../patcher";
import { getLazyByKeys, getProxyStore } from "@webpack";
import { forceUpdateApp } from "../../util";
import { IS_DESKTOP } from "vx:self";
import {createSettings, SettingType} from "../settings";

const GatewayConnectionStore = getProxyStore("GatewayConnectionStore");

const defaultSettingValue = IS_DESKTOP ? window.VXNative!.app.platform : "web";

const settings = createSettings("websocket-spoof", {
    ui: {
        default: defaultSettingValue,
        type: SettingType.SELECT,
        choices: [
            { label: "Windows", value: "win32" },
            { label: "OSX", value: "darwin" },
            { label: "Linux", value: "linux" },
            { label: "Web", value: "web" }
        ],
        onChange() {
            forceUpdateApp();
        },
        title: "Change the UI",
        description: "Change the UI for Windows",
    },
    platform: {
        default: defaultSettingValue,
        type: SettingType.SELECT,
        choices: [
            { label: "Windows", value: "win32" },
            { label: "OSX", value: "darwin" },
            { label: "Linux", value: "linux" },
            { label: "TempleOS", value: "temple" },
            { label: "Web", value: "web" },
            { label: "Android", value: "android" },
            { label: "iOS", value: "ios" },
            { label: "Web", value: "other" },
            {
                label: "Embedded (Generic Console)",
                value: "embedded",
            },
            {
                label: "Embedded (Playstation)",
                value: "playstation",
            },
            {
                label: "Embedded (Xbox)",
                value: "xbox",
            },
            {
                label: "None",
                value: "none",
            },
        ],
        description: "Change OS",
        placeholder: "Windows",
        title: "OS Spoof",
        onChange() {
            const socket = GatewayConnectionStore.getSocket();

            delete socket.sessionId;
            socket.webSocket.close();
        }
    }
});

const injector = new Injector()

const getCurrentPlatformWebsocket = () => {
    switch (settings.platform.get()) {
        case "win32":
            return { browser: "Discord Client", os: "Windows" };
        case "darwin":
            return { browser: "Discord Client", os: "Mac OS X" };
        case "linux":
            return { browser: "Discord Client", os: "Linux" };
        case "temple":
            return { browser: "Discord Client", os: "TempleOS" };
        case "web":
            return { browser: "Discord Web", os: "Other" };
        case "android":
            return { browser: "Discord Android", os: "Android" };
        case "ios":
            return { browser: "Discord iOS", os: "iOS" };
        case "embedded":
            return { browser: "Discord Embedded", os: "Other" };
        case "playstation":
            return { browser: "Discord Embedded", os: "Playstation" };
        case "xbox":
            return { browser: "Discord Embedded", os: "Xbox" };
    }
    
    return {};
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    patches: {
        match: "handleIdentify called",
        find: /{token:.{1,3},properties:.{1,3}\.default\.getSuperProperties\(\),presence:.{1,3}\.getInitialState\(\)}/,
        replace: "$self.handleIdentify($&,$enabled)"
    },
    handleIdentify(data: any, enabled: boolean) {
        if (enabled) {
            data.properties = Object.assign({}, data.properties, getCurrentPlatformWebsocket());
        }

        return data;
    },
    async start(signal: AbortSignal) {
        const PlatformCheckUtils = await getLazyByKeys([ "PlatformTypes", "getNativePlatform" ], { signal });
    
        injector.instead(PlatformCheckUtils, "isWindows", () => settings.ui.get() === "win32");
        injector.instead(PlatformCheckUtils, "isLinux", () => settings.ui.get() === "linux");
        injector.instead(PlatformCheckUtils, "isMac", () => settings.ui.get() === "darwin");
        injector.instead(PlatformCheckUtils, "isWeb", () => settings.ui.get() === "web");
        injector.instead(PlatformCheckUtils, "isDesktop", () => settings.ui.get() !== "web");
        
        injector.instead(PlatformCheckUtils, "getPlatform", (that, args, original) => {
            switch (settings.ui.get()) {
                case "linux": return "LINUX";
                case "darwin": return "OSX";
                case "web": return original();
                case "win32": return "WINDOWS";
            }
        });

        injector.instead(PlatformCheckUtils, "getOS", () => {
            switch (settings.ui.get()) {
                case "linux": return "linux";
                case "darwin": return "macos";
                case "web": return "WEB";
                case "win32": return "windows";
            }
        });
        
        injector.instead(PlatformCheckUtils, "getPlatformName", () => settings.ui.get());
    
        forceUpdateApp();
    },
    stop() {
        forceUpdateApp();
    },
    settings,
    injector
})