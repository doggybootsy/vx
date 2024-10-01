import { definePlugin } from "../index";
import { Developers } from "../../constants";
import {bySource, byStrings, getLazy, getMangledLazy, getModuleIdBySource, getProxy, webpackRequire} from "@webpack";
import { createElement } from "react";
import {Injector} from "../../patcher";
import {Button, Icons, SystemDesign, Tooltip} from "../../components";
import {openNotification} from "../../api/notifications";
import {proxyCache} from "../../util";
import {useEffect, useState} from "../../fake_node_modules/react";

const PanelMenu = getLazy(bySource('--custom-app-panels-height'));
const PanelButton = getProxy(byStrings("{tooltipText:", ".Masks.PANEL_BUTTON,"));
const ProtoSync = proxyCache(() => {
    const mId = getModuleIdBySource('"status","showCurrentGame"');
    const module = webpackRequire!.m[mId];

    const match = module.toString().match(/,(.{1,3}):function\(\){return (.{1,3})},.+,\2=\(0,.{1,3}\..{1,3}\)\("status","showCurrentGame"/);

    return webpackRequire!(mId)[match[1]];
});
const Controller = Icons.DiscordIcon.from("GameControllerIcon");

class Toolbar {
    private static items: { id: string; element: any }[] = [];

    static addItem(id: string, element: any): string {
        this.items.push({ id, element });
        return id;
    }

    static removeItem(id: string) {
        this.items = this.items.filter(item => item.id !== id);
    }

    static getItems() {
        return this.items.map(item => item.element);
    }
}

const inj = new Injector();

function getColorBasedOffStatus(enabled: boolean) {
    return enabled ? "green" : "red";
}

function GameToggleButton() {
    const [activityEnabled, setActivityEnabled] = useState(() => ProtoSync.getSetting());

    const toggleActivity = () => {
        const newStatus = !activityEnabled;
        ProtoSync.updateSetting(newStatus);
        setActivityEnabled(newStatus);
        openNotification({
            title: "ProtoSync Update",
            description: `Activity is currently ${newStatus ? "enabled" : "disabled"}.`,
            sliderColor: getColorBasedOffStatus(newStatus),
        });
    };

    return (
        <PanelButton
            tooltipText={"Game Activity Toggle"}
            onClick={toggleActivity}
            icon={(props) => (
                <Controller {...props} color={activityEnabled ? "var(--interactive-normal)" : "var(--red-430)"} />
            )}
        />
    );
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start(signal: AbortSignal) {
        const Module = await PanelMenu;

        if (signal.aborted) return;

        Toolbar.addItem("vx-game-button-toggle", <GameToggleButton />);

        const key = Object.entries(Module).find(x => x.toString?.().includes("--custom-app-panels-height"))![0];

        inj.after(Module, key, (a: any, b: any, c: any) => {
            c.props?.children?.push(
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                    }}
                >
                    {Toolbar.getItems().map((item) => item)}
                </div>
            );
        });
    },
    stop() {
        inj.unpatchAll();
        Toolbar.removeItem("vx-game-button-toggle");
    }
});
