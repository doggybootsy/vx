import {PluginInjector} from "../index";
import {Utils} from "./utils";
import {getByKeys, getProxyByKeys} from "@webpack";
import {settings} from "./index";

const PlatformCheckUtils = getProxyByKeys(["PlatformTypes", "getNativePlatform"])
export default (): void => {
    PluginInjector.instead(
        PlatformCheckUtils,
        "isWindows",
        () => settings.spoofWeb.get() === "win32",
    );
    PluginInjector.instead(
        PlatformCheckUtils,
        "isLinux",
        () => settings.spoofWeb.get() === "linux",
    );
    PluginInjector.instead(PlatformCheckUtils, "getOS", () =>
        settings.spoofWeb.get() === "linux"
            ? "linux"
            : settings.spoofWeb.get() === "win32"
                ? "windows"
                : "macos",
    );
    PluginInjector.instead(PlatformCheckUtils, "getPlatform", () =>
        settings.spoofWeb.get() === "linux"
            ? PlatformCheckUtils.PlatformTypes.LINUX
            : settings.spoofWeb.get() === "win32"
                ? PlatformCheckUtils.PlatformTypes.WINDOWS
                : PlatformCheckUtils.PlatformTypes.OSX,
    );
    PluginInjector.instead(
        PlatformCheckUtils,
        "isMac",
        () => settings.spoofWeb.get() === "darwin",
    );
    PluginInjector.instead(PlatformCheckUtils, "getPlatformName", () =>
        settings.spoofWeb.get(),
    );
    PluginInjector.instead(PlatformCheckUtils, "isWeb", () => false);
    PluginInjector.instead(PlatformCheckUtils, "isAndroid", () => false);
    PluginInjector.instead(PlatformCheckUtils, "isAndroidChrome", () => false);

    PluginInjector.instead(PlatformCheckUtils, "isAndroidWeb", () => false);
    PluginInjector.instead(PlatformCheckUtils, "isIOS", () => false);
    PluginInjector.instead(PlatformCheckUtils, "isDesktop", () => true);

    void Utils.forceRerenderElement('#app-mount > [class*="titleBar_"]');
};