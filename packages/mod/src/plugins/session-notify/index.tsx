import { definePlugin } from "../index";
import { subscribeToDispatch } from "@webpack/common";
import { Developers } from "../../constants";
import { openNotification } from "../../api/notifications";
import { bySource, getModule } from "@webpack";
import { UserSession } from "./types";
import { Icons } from "../../components";

const timeLimit = 20000;

async function fetchCity(): Promise<string | undefined> {
    const response = await fetch("https://ipinfo.io/json");
    const data = await response.json();
    return data.city;
}

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
    `;
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
                footer: "***City and Location are hidden for safety and security reasons. \nPlease verify this location OFF stream***",
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

async function handleSessionReplacement(): Promise<void> {
    const city = await fetchCity();
    const userSessions = await fetchUserSessions();
    await notifyUserIfSessionRecent(userSessions, city);
}

let unsubscribe: () => void;

// noinspection JSUnusedGlobalSymbols
export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    start(): void {
        unsubscribe = subscribeToDispatch("SESSIONS_REPLACE", handleSessionReplacement);
    },
    stop(): void {
        unsubscribe();
    },
});
