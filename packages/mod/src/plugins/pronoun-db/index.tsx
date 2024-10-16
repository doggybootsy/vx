import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { getProxy } from "@webpack";
import React, { useRef } from 'react';
import { ErrorBoundary } from "../../components";
import { className, InternalStore } from "../../util";
import { Message } from "discord-types/general";
import { useInternalStore } from "../../hooks";

const timestampModule = getProxy(X => X.timestampInline);

const CACHE_TTL = 60_000;
const CACHE_ERROR_TTL = 10_000;

type PronounDBResponse = {
    [userId: string]: {
        sets: {
            en: string[]
        }
    }
}

class PronounDBStore extends InternalStore {
    static displayName = "PronounDBStore";

    private cache: Record<string, {
        state: "resolving" | "resolved" | "rejected",
        request: Promise<string | null>,
        timestamp: number,
        result: string | null
    }> = {}

    private async fetchPronouns(userId: string) {
        const res = await request(`https://pronoundb.org/api/v2/lookup?platform=discord&ids=${userId}`);

        if (!res.ok) return null;

        const { [userId]: data } = await res.json() as PronounDBResponse;

        if (typeof data === "undefined") return null;

        const pronouns = data.sets.en;

        if (pronouns.length > 1) return pronouns.join("/");

        switch (pronouns[0]) {
            case "he": return "he/him";
            case "it": return "it/its";
            case "she": return "she/her";
            case "they": return "they/them";
            default: return pronouns[0];
        }
    }
    private getPronouns(userId: string) {
        if (this.cache[userId]?.state === "resolved") {
            return this.cache[userId].result;
        }

        return null;
    }

    private requestPronouns(userId: string) {
        let cache = this.cache[userId];        

        const shouldRefetch = typeof cache === "undefined" ? (
            true
        ) : cache.state === "rejected" ? (
            (Date.now() - cache.timestamp) > CACHE_ERROR_TTL
        ) : (Date.now() - cache.timestamp) > CACHE_TTL;

        if (shouldRefetch) {
            const request = this.fetchPronouns(userId).then(
                (res) => {                    
                    cache.result = res;
                    cache.state = "resolved";

                    this.emit();

                    return res;
                }, 
                () => {
                    this.cache[userId].state = "rejected";
                    return null;
                }
            );

            this.cache[userId] = cache = {
                state: "resolving",
                result: null,
                timestamp: Date.now(),
                request
            };

            this.emit();
        }

        return cache;
    }
    
    public usePronouns(userId: string) {
        const pronouns = useInternalStore(this, () => this.getPronouns(userId));
        const ref = useRef(true);
        
        if (!pronouns && ref.current) {
            this.requestPronouns(userId);
            ref.current = false;
        }

        return pronouns;
    }

    // public usePronouns(userId: string) {
    //     const [ pronouns, setState ] = useState(() => this.getPronouns(userId));
    //     const ref = useRef(true);
        
    //     if (!pronouns && ref.current) {
    //         this.requestPronouns(userId).request.then((pronouns) => {
    //             setState(pronouns);
    //         });
    //         ref.current = false;
    //     }

    //     return pronouns;
    // }
}

const pronounDBStore = new PronounDBStore();

const PronounDisplay = ({ message }: { message: Message }) => {
    const pronouns = pronounDBStore.usePronouns(message.author.id);

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
        find: /,.{1,3}&&!.{1,3}&&\(0,.{1,3}\.jsx\)\(.{1,3}\.Z,{id:\(0,.{1,3}\..{1,3}\)\((.{1,3})\),timestamp:\1\.timestamp,className:.{1,3},application:.{1,3}}\),/,
        replace: "$&$enabled&&$self.addShit($1),"
    },
    addShit(message: Message) {
        return (
            <ErrorBoundary>
                <PronounDisplay message={message} />
            </ErrorBoundary>
        )
    },
});
