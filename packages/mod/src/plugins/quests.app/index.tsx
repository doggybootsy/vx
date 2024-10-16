import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import {
    bySource,
    byStrings,
    getModule,
    getProxyStore, getStore,
    whenWebpackReady
} from "@webpack";
import { Injector } from "../../patcher";
import { createAbort } from "../../util";
import { Button, Icons, SystemDesign } from "../../components";
import {FluxDispatcher, UserStore} from "@webpack/common";

const ApplicationStreamingStore = getProxyStore("ApplicationStreamingStore");
const RunningGameStore = getProxyStore("RunningGameStore");
const QuestsStore = getProxyStore("QuestsStore");
const ExperimentStore = getProxyStore("ExperimentStore");
const VoiceStateStore = getProxyStore("VoiceStateStore");

const inj = new Injector();
const BLACKLISTED_QUEST_IDS = ['1248385850622869556'];

class QuestManager {
    public quests: any[] = [];
    public patch: any;
    public questProgresses: { id: string, progress: string }[] = [];

    public updateQuestProgress(questId: string, progress: number, total: number) {
        const percentage = Math.floor((progress / total) * 100);
        const existingIndex = this.questProgresses.findIndex(q => q.id === questId);
        if (existingIndex !== -1) {
            this.questProgresses[existingIndex].progress = `${percentage}%`;
        } else {
            this.questProgresses.push({ id: questId, progress: `${percentage}%` });
        }
    }

    public getQuestProgress(questId: string): string {
        const quest = this.questProgresses.find(q => q.id === questId);
        return quest ? quest.progress : "Complete";
    }

    public isQuestInProgress(questId: string): boolean {
        return this.questProgresses.some(q => q.id === questId);
    }
}

const questManager = new QuestManager();

const [abort, getSignal] = createAbort();

async function initQuests() {
    questManager.quests = [...QuestsStore.quests.values()].filter(quest =>
        isValidQuest(quest)
    );
}

const isFutureDate = (date: string | number | Date) => new Date(date).getTime() > Date.now();

function isValidQuest(quest: any) {
    return !BLACKLISTED_QUEST_IDS.includes(quest.id) &&
        quest.userStatus?.enrolledAt &&
        !quest.userStatus?.completedAt &&
        isFutureDate(quest.config.expiresAt);
}

function getModuleWithKey(filter: Function) {
    let module;
    getModule((exports, $module) => {
        if (filter(exports, $module, $module.id)) {
            module = $module;
        }
    });
    return module;
}

async function handleQuest(quest: any) {
    const questConfig = getQuestConfig(quest);
    const { applicationId, applicationName, secondsNeeded, canPlay } = questConfig;

    if (canPlay) {
        await handlePlayQuest(quest, applicationId, applicationName);
    } else {
        await handleStreamQuest(quest, applicationId, secondsNeeded);
    }
}

function getQuestConfig(quest: any) {
    if (quest.config.configVersion === 1) {
        return getQuestConfigV1(quest);
    } else if (quest.config.configVersion === 2) {
        return getQuestConfigV2(quest);
    }
    throw new Error("Unsupported quest config version");
}

function getQuestConfigV1(quest: any) {
    return {
        applicationId: quest.config.applicationId,
        applicationName: quest.config.applicationName,
        secondsNeeded: quest.config.streamDurationRequirementMinutes * 60,
        secondsDone: quest.userStatus?.streamProgressSeconds ?? 0,
        canPlay: quest.config.variants.includes(2)
    };
}

const fakePID = () => 1000 + window.crypto.getRandomValues(new Uint32Array(1))[0] % 29001;

function getQuestConfigV2(quest: any) {
    const canPlay = ExperimentStore.getUserExperimentBucket("2024-04_quest_playtime_task") > 0 && quest.config.taskConfig.tasks["PLAY_ON_DESKTOP"];
    const taskName = canPlay ? "PLAY_ON_DESKTOP" : "STREAM_ON_DESKTOP";
    return {
        applicationId: quest.config.application.id,
        applicationName: quest.config.application.name,
        secondsNeeded: quest.config.taskConfig.tasks[taskName].target,
        secondsDone: quest.userStatus?.progress?.[taskName]?.value ?? 0,
        canPlay
    };
}

async function handlePlayQuest(quest: any, applicationId: string, secondsNeeded: number) {
    const HTTP = getModule(bySource('rateLimitExpirationHandler'));
    // @ts-ignore
    const api: any = await Object.values(HTTP).find(x => x.get);
    const pid = fakePID();

    api.get({url: `/applications/public?application_ids=${applicationId}`}).then((res: { body: any[]; }) => {
        const paths = res.body[0];
        const fakeGame = createFakeGame(paths, pid);
        addFakeGameToRunningGames(fakeGame);
        subscribeToQuestProgress(quest, secondsNeeded, fakeGame);
    });
}

function createFakeGame(path: any, pid: number) {
    const exeName = path.executables.find((x: { os: string; }) => x.os === "win32").name.replace(">", "");
    return {
        cmdLine: `C:\\Program Files\\${path.name}\\${exeName}`,
        exeName, 
        exePath: `c:/program files/${path.name.toLowerCase()}/${exeName}`,
        hidden: false,
        isLauncher: false,
        id: path.id,
        name: path.name,
        pid: pid,
        pidPath: [pid],
        processName: path.name,
        start: new Date().getTime()
    };
}

function addFakeGameToRunningGames(fakeGame: any) {
    const games = RunningGameStore.getRunningGames();
    games.push(fakeGame);
    FluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: [], added: [fakeGame], games: games});
}

function subscribeToQuestProgress(quest: any, secondsNeeded: number, fakeGame: any) {
    let startingProgress = ({ userStatus }: { userStatus: { streamProgressSeconds: any; progress: { PLAY_ON_DESKTOP: { value: number; }; }; }; }) => {
        let progress = quest.config.configVersion === 1 ? userStatus.streamProgressSeconds : Math.floor(userStatus.progress.PLAY_ON_DESKTOP.value);
        questManager.updateQuestProgress(quest.id, progress, secondsNeeded);
        if (progress >= secondsNeeded) {
            removeFakeGameFromRunningGames(fakeGame);
            FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", startingProgress);
        }
    };
    FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", startingProgress);
}

function removeFakeGameFromRunningGames(fakeGame: any) {
    const games = RunningGameStore.getRunningGames();
    const idx = games.indexOf(fakeGame);
    if (idx > -1) {
        games.splice(idx, 1);
        FluxDispatcher.dispatch({
            type: "RUNNING_GAMES_CHANGE",
            removed: [fakeGame],
            added: [],
            games: []
        });
    }
}

async function handleStreamQuest(quest: any, applicationId: string, secondsNeeded: number) {
    const realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
    const pid = Math.floor(Math.random() * 30000) + 1000;

    ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
        id: applicationId,
        pid,
        sourceName: null
    });

    subscribeToStreamQuestProgress(quest, secondsNeeded, realFunc);
}

function subscribeToStreamQuestProgress(quest: any, secondsNeeded: number, realFunc: Function) {
    let startingProgress = ({ userStatus }: { userStatus: { streamProgressSeconds: any; progress: { STREAM_ON_DESKTOP: { value: number; }; }; }; }) => {
        let progress = quest.config.configVersion === 1 ? userStatus.streamProgressSeconds : Math.floor(userStatus.progress.STREAM_ON_DESKTOP.value);
        questManager.updateQuestProgress(quest.id, progress, secondsNeeded);
        if (progress >= secondsNeeded) {
            ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
            FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", startingProgress);
        }
    };
    FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", startingProgress);
}

async function startCompletingQuest(quest: any) {
    await handleQuest(quest);
}

function isUserInCall()
{
    return VoiceStateStore.getVoiceStateForUser(UserStore.getCurrentUser().id)
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    icon: Icons.DiscordIcon.from("QuestsIcon"),
    async start() {
        const signal = getSignal();
        await whenWebpackReady();

        if (signal.aborted) return;

        const module = getModule(bySource('questContentCTA:d.jZ.DEFIBRILLATOR'))

        await initQuests();

        if (module) {
            // @ts-ignore
            inj.after(module, 'default', (_, __, returnValue) => {
                // @ts-ignore
                const quest = __[0].quest;
                const canComplete = isFutureDate(quest.config.expiresAt)
                if (canComplete) {
                    returnValue.props.children.push(
                        <Button
                            disabled={questManager.isQuestInProgress(quest.id) || !isUserInCall() || quest?.userStatus?.completedAt}
                            color={SystemDesign.Button.BRAND}
                            onClick={() => {startCompletingQuest(quest); console.log(quest)}}
                        >
                            {questManager.getQuestProgress(quest.id) || "Complete"}
                        </Button>
                    );
                }
            });
        }
    },
    stop() {
        abort();
        inj.unpatchAll();
    },
});