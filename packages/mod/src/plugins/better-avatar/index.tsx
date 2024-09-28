import { definePlugin } from "../index";
import { Developers } from "../../constants";
import {bySource, getLazy, getModule, getProxy} from "@webpack";
import { Injector } from "../../patcher";
import { createAbort, findInReactTree } from "../../util";

const INJECT: Injector = new Injector();

const [ abort, getSignal ] = createAbort();

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start() {
        const signal = getSignal();
        const GIF_CROP: any = await getLazy(bySource('ImageCroppingModal'));
        if (signal.aborted) return;        
        
        INJECT.after(GIF_CROP, 'default', (_: any, __: any, returnValue: any) => {            
            // @ts-ignore
            const SliderContainer: { children: Array<{ props: { maxValue: number, stickToMarkers: boolean } }> } = findInReactTree(returnValue, (x: { className: string | string[]; }) => x?.className?.includes?.('sliderContainer'));
            
            if (!SliderContainer?.children) return;

            const Slider = SliderContainer.children[1].props
            Slider.maxValue = 20;
        });
    },
    stop() {
        INJECT.unpatchAll();
        abort();
    }
});