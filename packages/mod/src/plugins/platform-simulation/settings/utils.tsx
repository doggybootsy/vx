import {waitFor} from "common/util";
import {getOwnerInstance} from "../../../util";
import Types from "./types";
import {settings} from "./index";
import {PluginInjector} from "../index";

export const forceRerenderElement = async (selector: string): Promise<void> => {
    const element = await waitFor(() => selector);
    if (!element) return;
    const ownerInstance = getOwnerInstance(element);
    const unpatchRender = PluginInjector.instead(ownerInstance, "render", () => {
        unpatchRender();
        return null;
    });
    ownerInstance.forceUpdate(() => ownerInstance.forceUpdate(() => {}));
};

export const getCurrentPlatformWebsocket = (): Types.PlatformWebsocket | Record<never, never> => {
    console.log("Spoof Web: ", settings.spoofWeb.get());
    switch (settings.spoofWeb.get()) {
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
        case "none":
            return {};
    }
};

export const Utils =  { getCurrentPlatformWebsocket, forceRerenderElement }