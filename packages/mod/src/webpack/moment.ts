import { getProxyByKeys } from "@webpack";

const moment = getProxyByKeys<typeof import("moment")>([ "isMoment" ]);

export default moment;