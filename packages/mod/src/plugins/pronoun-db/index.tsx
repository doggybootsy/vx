import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { bySource, getProxy, whenWebpackInit } from "@webpack";
import React, { ReactNode, useEffect, useState } from 'react';
import { ErrorBoundary } from "../../components";
import { className, findInReactTree } from "../../util";

const timestampModule = getProxy(X => X.timestampInline);

const CACHE_TTL = 60 * 1000;
const CACHE_ERROR_TTL = 10 * 1000;

/* Stern PronounDB Plugin */
const API_URL = "https://pronoundb.org";

const Endpoints = {
    LOOKUP: (userId: string) => `${API_URL}/api/v2/lookup?platform=discord&ids=${userId}`,
};

export class DataStore {
    private store: {
        [key: string]: { value: any, expiry: number, isError?: boolean, ongoingRequest?: Promise<any> }
    } = {};
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    set(key: string, value: any, isError: boolean = false, ttl: number = CACHE_TTL) {
        this.store[key] = { value, expiry: Date.now() + ttl, isError };
    }

    get(key: string) {
        const item = this.store[key];
        if (item) {
            if (item.expiry > Date.now()) {
                return item.value;
            } else {
                delete this.store[key];
            }
        }
        return null;
    }

    has(key: string) {
        const item = this.store[key];
        return item !== undefined && item.expiry > Date.now();
    }

    isError(key: string) {
        const item = this.store[key];
        return item && item.isError && item.expiry > Date.now();
    }

    setOngoingRequest(key: string, request: Promise<any>) {
        this.store[key] = { ...this.store[key], ongoingRequest: request };
    }

    getOngoingRequest(key: string) {
        return this.store[key]?.ongoingRequest;
    }

    use(key: string) {
        const [value, setValue] = useState(this.get(key));

        useEffect(() => {
            const checkForUpdates = () => {
                const newValue = this.get(key);
                if (newValue !== value) {
                    setValue(newValue);
                }
            };

            const interval = setInterval(checkForUpdates, 1000);
            return () => clearInterval(interval);
        }, [key, value]);

        return value;
    }
}

let dataStore: DataStore = new DataStore("PronounDB");

async function makeApiRequest(url: string): Promise<Response> {
    return await fetch(url, {
        headers: {
            // "User-Agent": USER_AGENT
        }
    });
}

async function fetchPronounData(userId: string): Promise<any> {
    const cacheKey = `user_${userId}`;

    // Check for cached error
    if (dataStore.isError(cacheKey)) {
        console.log(`Cached error for user ${userId}, skipping API call.`);
        return null;
    }

    const cachedResponse = dataStore.get(cacheKey);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    dataStore.set(cacheKey, { loading: true });

    const ongoingRequest = dataStore.getOngoingRequest(cacheKey);
    if (ongoingRequest) {
        return ongoingRequest;
    }

    const url = Endpoints.LOOKUP(userId);
    const apiRequest = (async () => {
        try {
            const response = await makeApiRequest(url);
            if (!response.ok) throw new Error(`Error fetching pronoun data: ${response.status}`);

            const data = await response.json();
            const firstEntry = Object.values(data)[0];

            dataStore.set(cacheKey, firstEntry);

            return firstEntry;
        } catch (error) {
            console.error(`Failed to fetch pronoun data for user ${userId}:`, error);
            dataStore.set(cacheKey, null, true, CACHE_ERROR_TTL);
            return null;
        }
    })();

    dataStore.setOngoingRequest(cacheKey, apiRequest);

    apiRequest.finally(() => {
        dataStore.setOngoingRequest(cacheKey, null);
    });

    return apiRequest;
}

const PronounDisplay = ({ res }: { res: any }) => {
    const authorReal = findInReactTree(res, x => x?.message).message.author;
    const userId = authorReal.id;
    const cachedPronouns = dataStore.use(`user_${userId}`);
    const [pronouns, setPronouns] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await fetchPronounData(userId);
            if (userData) {
                setPronouns(cachedPronouns?.sets['en']?.join("/") ?? [void 0]);
            } else {
                setPronouns(null);
            }
        };

        if (cachedPronouns?.loading) {
            setPronouns(null); 
        } else if (cachedPronouns) {
            setPronouns(cachedPronouns?.sets['en']?.join("/") ?? [void 0]);
        } else {
            fetchData();
        }
    }, [userId, cachedPronouns]);

    if (!pronouns) return null;

    return (
        <div className={className([timestampModule.timestamp, timestampModule.timestampInline])}>
            {`- ${pronouns}`}
        </div>
    );
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    patches: {
        match: ".communicationDisabledOpacity]:",
        find: /(\(0,\s*r\.jsx\)\(w\.Z,\s*\{\s*id:\s*\(0,\s*U\.Dv\)\(t\),\s*timestamp:\s*t\.timestamp,\s*className:\s*h\s*}\))(,?)/,
        replace: "$1,$enabled&&$self.addShit({res:i}),"
    },
    addShit({ res }: { res: ReactNode }) {
        return (
            <ErrorBoundary fallback={res}>
                <PronounDisplay res={res}  />
            </ErrorBoundary>
        )
    },
});
