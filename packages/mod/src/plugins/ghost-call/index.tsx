import { definePlugin } from "../index";
import { Developers } from "../../constants";
import {bySource, getProxy} from "@webpack";
import {createElement} from "react";

const ButtonModule: any = getProxy(bySource(".lineHeightReset"));

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

        const CustomSVGIcon = () => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-1.9801 -10.9728 46.48 40.97"
                width="25px"
                height="25px"
                fill="white"
                style={{cursor: "pointer"}}
            >
                <path
                    d="m41 14.8203c-2.7684-2.9885-9.6048-8.8133-22.11-7.3173-.1371.0164-.2481.1425-.2481.2806v1.615a.2508.2508 134.9097 01-.25.2508l-5.211.0164c-.1381.0004-.362.0011-.4999.0059-.6228.0216-1.1698.1095-1.641.2639-.1312.043-.3352.135-.4582.1976-2.6805 1.3655-4.5592 2.7889-6.4833 4.6852-.0984.0969-.2571.2548-.3534.3538-4.5341 4.6618-3.9257 10.5222-.5327 14.0874.0952.1.2529.26.3641.3417.4355.3199 1.003.4052 1.5136.2272.1303-.0454.3278-.1523.4499-.2169l8.198-4.34c.122-.0646.3212-.1681.4334-.2484.583-.4172.8721-1.1387.7386-1.8428-.0258-.1356-.0985-.348-.1422-.479l-1.3058-3.9156c-.0437-.131.0119-.3024.1255-.3809 5.3751-3.7124 12.4898-3.7124 17.8648 0 .1136.0785.1752.2517.1389.3849l-1.3966 5.1256c-.0363.1332-.0969.3493-.1149.4861-.097.737.2604 1.4641.9031 1.8367.1194.0692.3276.153.4553.2056l8.1017 3.3356c.1277.0526.3346.14.4686.1728.478.1173.9851.0152 1.3813-.2768.111-.0819.2687-.2418.3639-.3418 3.3892-3.5621 4.0683-9.506-.4094-14.1507-.0958-.0994-.2503-.2614-.3441-.3627zM-1 9l18.385.0047a.626.626 90 00.6262-.6248l.0075-3.7275a.6238.6238 90 00-.6238-.6252h-8.75a.259.259 90 01-.183-.442l9.116-9.116a1.509 1.509 90 00.442-1.067v-3.75a.625.625 90 00-.625-.625h-18.75a.625.625 90 00-.625.625v3.75a.625.625 90 00.625.625h8.75a.2655.2655 90 01.191.4497l-8.7772 9.1003a1.5483 1.5483 90 00-.4338 1.075v3.7225a.6253.6253 90 00.625.6252z"/>
            </svg>
        );

        return <div>
            <ButtonModule.default
                label="Dismiss"
                centerButton
                iconComponent={() => {
                    return <CustomSVGIcon/>
                }}
                background="gray"
                onClick={() => {
                    audioContext?.stop();
                }}
            />
        </div>
    }
});
