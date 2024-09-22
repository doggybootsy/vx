import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { bySource, getLazy, getModule } from "@webpack";

const inj = new Injector();
export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    patches: [
        {
            match: ".useIsRingtoneEligible",
            find: /((\w+)=\(0,\w+\.\w+\)\(\(\)=>{let \w+="call_ringing";.{500,800})(animatedStyle)/,
            replace: (match, prefix, variable, suffix) => `${prefix}audioContext:${variable},${suffix}`,
        },
        {
            identifier: "ghost", 
            match: ".RingingType.INCOMING",
            find: /INCOMING_CALL_PREVIEW_CAMERA}\):null/,
            replace: (prefix: string) =>
                `${prefix},VX.React.createElement('div',{},VX.React.createElement(VX.webpack.getModule(VX.webpack.filters.bySource(".lineHeightReset")).Z,{label: "Ghost End", centerButton: true, iconComponent: VX.webpack.getModule(VX.webpack.filters.bySource("M22.89 11.7c.07.2.07.4")).t, background: "gray", onClick: () => {arguments?.[0]?.audioContext.stop()}}))`,
        }
    ],
    _renderButton: ({audioContext}) => {
        return (
            <div style={{background: 'red'}}>
                hello WORLDP:FKJDLFJKHNDFLKLDFKL
            </div>
        )
    }
});
