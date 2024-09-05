import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { openNotification } from "../../api/notifications";
import { bySource, getModule, whenWebpackReady } from "@webpack";
import { UserSession } from "./types";
import { Icons, Markdown } from "../../components";
import { DataStore } from "../../api/storage";
import { openConfirmModal } from "../../api/modals";
import { Messages } from "vx:i18n";
import { createAbort } from "../../util";

const timeLimit = 20_000;

const fetchCity = cache(async () => {
    try {
        const { json } = await request.json<{ city: string }>("https://ipinfo.io/json");
        return json.city;
    } 
    catch (error) {
        
    }
});
// After 10 calls let it refetch it
fetchCity.CALL_LIMIT = 10;

function formatMessage(session: UserSession, city: string | undefined): string {
    const { client_info } = session;
    const { os, location } = client_info;
    const osDescription = os ? `${capitalize(os)}` : "Unknown OS";
    const locationInfo = location ? location : "Unknown location";

    return `
**New Session Detected!**

A new device session has been detected on your account. Please verify if this was you.

**Session Details:**
- **Operating System:** ${osDescription}
- **Location:** ||${locationInfo}||

${city && location && !location.includes(city)
    ? `**Warning:** The location of this device ||(${locationInfo})|| does not match your current city ||(${city})||. 
    ***Please take appropriate action if this is not your activity.***`
: ''}
    `.trim();
}

function capitalize(text: string | undefined): string {
    if (!text) return "N/A";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function isSessionRecent(session: UserSession, timeLimit: number): boolean {
    const now = new Date().getTime();
    const lastUsed = new Date(session.approx_last_used_time).getTime();
    const timeDiff = now - lastUsed;
    return timeDiff <= timeLimit;
}

async function notifyUserIfSessionRecent(userSessions: UserSession[], city: string | undefined): Promise<void> {
    for (const session of userSessions) {
        if (isSessionRecent(session, timeLimit)) {
            const message = formatMessage(session, city);
            openNotification({
                id: "new-device-notification",
                title: "New Device Session",
                description: message,
                footer: [
                    <Markdown text="***City and Location are hidden for safety and security reasons***" />,
                    <Markdown text="***Please verify this location OFF stream***" />
                ],
                duration: Infinity,
                type: "danger",
                icon: Icons.Notice,
            });
        }
    }
}

async function fetchUserSessions(): Promise<UserSession[]> {
    const HTTP = getModule(bySource('rateLimitExpirationHandler'));
    // @ts-ignore
    const response = await Object.values(HTTP).find(x => x.get)?.get('/auth/sessions');
    return response.body?.user_sessions || [];
}

const storage = new DataStore<{ isNotFirstRun: boolean }>("session-notify");

const [ abort, getSignal ] = createAbort();

const plugin = definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    fluxEvents: {
        async SESSIONS_REPLACE() {            
            const city = await fetchCity();
            const userSessions = await fetchUserSessions();
            await notifyUserIfSessionRecent(userSessions, city);
        }
    },
    // Warn the user of the ip usage
    warnUser() {
        if (storage.has("isNotFirstRun")) return;
        storage.set("isNotFirstRun", true);

        openConfirmModal("Warning", [
            `**${Messages.SESSION_NOTIFY_NAME}** uses your **IP Address** to get your city`,
            "It does not share your location",
            "If you don't want this, disable this plugin"
        ], {
            danger: true,
            confirmText: Messages.DISABLE,
            onConfirm() {
                plugin.disable();
            }
        });
    },
    async start() {
        const signal = getSignal();
        await whenWebpackReady();

        if (signal.aborted) return;

        this.warnUser();
    },
    stop() {
        abort();
    }
});
