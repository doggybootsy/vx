import { definePlugin } from "../index";
import { Developers } from "../../constants";
import {bySource, byStrings, getLazy, getMangledLazy, getModuleIdBySource, getProxy, webpackRequire} from "@webpack";
import { createElement } from "react";
import {Injector} from "../../patcher";
import {Button, SystemDesign, Tooltip} from "../../components";
import {openNotification} from "../../api/notifications";
import {proxyCache} from "../../util";

const PanelMenu = getLazy(bySource('--custom-app-panels-height'));
const PanelButton = getProxy(byStrings("{tooltipText:", ".Masks.PANEL_BUTTON,"));
const ProtoSync = proxyCache(() => {
    const mId = getModuleIdBySource('"status","showCurrentGame"');
    const module = webpackRequire!.m[mId];

    const match = module.toString().match(/,(.{1,3}):function\(\){return (.{1,3})},.+,\2=\(0,.{1,3}\..{1,3}\)\("status","showCurrentGame"/);

    return webpackRequire!(mId)[match[1]];
});

class Toolbar {
    private static items: { id: string; element: any }[] = [];

    static addItem(id: string,  element: any): string {
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

function getColorBasedOffStatus(enabled: boolean)
{
    switch (enabled) {
        case true: 
            return "green"
        case false:
            return "red"
    }
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start(signal: AbortSignal) {
        const Module = await PanelMenu;

        if (signal.aborted) return;
        
        const GameToggleButton = <PanelButton tooltipText={"Game Activity Toggle"} onClick={() => {
                const ActivitySetting = !ProtoSync.getSetting()
                ProtoSync.updateSetting(ActivitySetting)
                openNotification({title: "ProtoSync Update", description: `Activity is currently ${ActivitySetting ? "enabled" : "disabled"}.`, sliderColor: getColorBasedOffStatus(ActivitySetting)})
            }} icon={() => (<SystemDesign.GameControllerIcon/>)}/>
        
        Toolbar.addItem("vx-game-button-toggle", GameToggleButton)

        const key = Object.entries(Module).find(x=>x.toString?.().includes("--custom-app-panels-height"))![0];
        
        inj.after(Module, key, (a: any, b: any, c: any) => {

            c.props?.children?.push(<div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                }}
            >
                {Toolbar.getItems().map((item) => (
                    item
                ))}
            </div>);
        });
    },
    stop() {
        inj.unpatchAll()
        Toolbar.removeItem("vx-game-button-toggle");
    }
});
