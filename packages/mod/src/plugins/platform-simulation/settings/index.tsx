import {createSettings, SettingType} from "../../settings";

export const settings = createSettings("websocket-spoof", {
    changeUI:
        {
            default: "win32",
            type: SettingType.SELECT,
            choices: [
                { label: "Windows", value: "win32" },
                { label: "OSX", value: "darwin" },
                { label: "Linux", value: "linux" },
            ],
            title: "Change the UI",
            description: "Change the UI for Windows",
        },
    spoofWeb:
        {
            default: "none",
            type: SettingType.SELECT,
            choices: [
                { label: "Windows", value: "win32" },
                { label: "OSX", value: "darwin" },
                { label: "Linux", value: "linux" },
                { label: "TempleOS", value: "temple" },
                { label: "Web", value: "web" },
                { label: "Android", value: "android" },
                { label: "iOS", value: "ios" },
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
            placeholder: "sdfsdf",
            title: "OS Spoof"
        }
})