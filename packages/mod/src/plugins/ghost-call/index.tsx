import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { bySource, getModule } from "@webpack";
import {createElement} from "react";

const inj = new Injector();

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    patches: [
        {
            match: ".useIsRingtoneEligible",
            find: /((\w+)=\(0,\w+\.\w+\)\(\(\)=>{let \w+="call_ringing";.{500,800})(animatedStyle)/,
            replace: (match, prefix, variable, suffix) =>
                `${prefix}audioContext:${variable},${suffix}`,
        },
        {
            identifier: "ghost",
            match: ".RingingType.INCOMING",
            find: /INCOMING_CALL_PREVIEW_CAMERA}\):null/,
            replace: `$&, $self._renderButton(arguments?.[0])`,
        },
    ],
    
    _renderButton: ({ audioContext }) => {
        const ButtonModule: any = getModule(bySource(".lineHeightReset"));
        const IconComponent: any = getModule(bySource("M22.89 11.7c.07.2.07.4"));

        return createElement(
            "div",
            {},
            createElement(ButtonModule.Z, {
                label: "Ghost End",
                centerButton: true,
                iconComponent: IconComponent.t,
                background: "gray",
                onClick: () => {
                    audioContext?.stop();
                },
            })
        );
    },
});
