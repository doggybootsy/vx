import { definePlugin } from "../index";
import { Developers } from "../../constants";
import {bySource, byStrings, getLazy, getProxy, getProxyByStrings} from "@webpack";
import { createElement } from "react";
import {Injector} from "../../patcher";
import {Button, SystemDesign, Tooltip} from "../../components";
import {openNotification} from "../../api/notifications";

const PanelMenu = getLazy(bySource('--custom-app-panels-height'));
const PanelButton = getProxy(byStrings("{tooltipText:", ".Masks.PANEL_BUTTON,"));
const ProtoSync = getProxy(x=>x.G6.updateSetting);

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
        if (signal.aborted) return;
        
        const GameToggleButton =
            <Tooltip text={"Game Toggle"}>
                {(props) => (
                    <PanelButton {...props} onClick={() => {
                        const ActivitySetting = !ProtoSync.G6.getSetting()
                        ProtoSync.G6.updateSetting(ActivitySetting)
                        openNotification({title: "ProtoSync Update", description: `Activity is currently ${ActivitySetting ? "enabled" : "disabled"}.`, sliderColor: getColorBasedOffStatus(ActivitySetting)})
                    }} icon={() => (<SystemDesign.GameControllerIcon/>)}/>
                )}
            </Tooltip>
        
        Toolbar.addItem("vx-game-button-toggle", GameToggleButton)
        
        // @ts-ignore
        inj.after(await PanelMenu, 'b', (a: any, b: any, c: { props: { children: React.DetailedReactHTMLElement<{ style: { display: "flex"; justifyContent: "center"; alignItems: "center"; color: "white"; }; }, HTMLElement>[]; }; }) => {
            console.log(a, b, c);

            const centeredDiv = createElement("div", {
                style: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white"
                }
            }, [
                ...Toolbar.getItems().map((item: any) => item)
            ]);

            c.props?.children?.push(centeredDiv);
        });
    },
    stop()
    {
        inj.unpatchAll()
        Toolbar.removeItem("vx-game-button-toggle");
    }
});
