import {Store} from "@webpack/common";

export namespace Types {
    export type GenericModule = Record<string, Function>;
    export interface TitleBarClasses {
        focused: string;
        macButton: string;
        macButtonClose: string;
        macButtonMaximize: string;
        macButtonMinimize: string;
        macButtons: string;
        macDragRegion: string;
        titleBar: string;
        typeMacOS: string;
        typeMacOSWithFrame: string;
        typeWindows: string;
        unfocused: string;
        winButton: string;
        winButtonClose: string;
        winButtonMinMax: string;
        withBackgroundOverride: string;
        withFrame: string;
        wordmark: string;
        wordmarkMacOS: string;
        wordmarkWindows: string;
    }
    export interface PlatformCheckUtils {
        PlatformTypes: {
            WINDOWS: string;
            OSX: string;
            LINUX: string;
            WEB: string;
        };
        getNativePlatform: Function;
        getOS: Function;
        getPlatform: Function;
        getPlatformName: Function;
        isAndroid: Function;
        isAndroidChrome: Function;
        isAndroidWeb: Function;
        isDesktop: Function;
        isIOS: Function;
        isLinux: Function;
        isMac: Function;
        isPlatformEmbedded: boolean;
        isWeb: Function;
        isWindows: Function;
    }
    export interface Socket {
        analytics: object;
        compressionHandler: object;
        connectionStartTime: number;
        connectionState: string;
        didForceClearGuildHashes: boolean;
        dispatchExceptionBackoff: object;
        dispatchSuccessTimer: number;
        expeditedHeartbeatTimeout: null | number;
        gatewayBackoff: object;
        handleIdentify: Function;
        hasConnectedOnce: boolean;
        heartbeatAck: boolean;
        heartbeatInterval: number;
        heartbeater: number;
        helloTimeout: null | number;
        identifyCompressedByteSize: number;
        identifyStartTime: number;
        identifyUncompressedByteSize: number;
        initialHeartbeatTimeout: null | number;
        isDeferringDispatches: boolean;
        isFastConnect: boolean;
        lastHeartbeatAckTime: number;
        nextReconnectIsImmediate: boolean;
        queuedDispatches: [];
        resumeAnalytics: object;
        resumeUrl: string;
        send: Function;
        seq: number;
        sessionId: string;
        token: string;
        webSocket: object;
        _events: object;
        _eventsCount: number;
        _maxListeners: undefined | number;
        addAnalytics: Function;
        callConnect: Function;
        close: Function;
        connect: Function;
        embeddedActivityClose: Function;
        expeditedHeartbeat: Function;
        getDeletedEntityIdsNotMatchingHash: Function;
        getIdentifyInitialGuildId: Function;
        getLogger: Function;
        hasQueuedDispatches: Function;
        isClosed: Function;
        isConnected: Function;
        isSessionEstablished: Function;
        lobbyConnect: Function;
        lobbyDisconnect: Function;
        lobbyVoiceStatesUpdate: Function;
        networkStateChange: Function;
        presenceUpdate: Function;
        processDispatchQueue: Function;
        processFirstQueuedDispatch: Function;
        remoteCommand: Function;
        requestForumUnreads: Function;
        requestGuildMembers: Function;
        requestLastMessages: Function;
        requestSoundboardSounds: Function;
        resetBackoff: Function;
        resetSocketOnError: Function;
        setResumeUrl: Function;
        speedTestCreate: Function;
        speedTestDelete: Function;
        streamCreate: Function;
        streamDelete: Function;
        streamPing: Function;
        streamSetPaused: Function;
        streamWatch: Function;
        updateGuildSubscriptions: Function;
        voiceServerPing: Function;
        voiceStateUpdate: Function;
        willReconnect: Function;
        _cleanup: Function;
        _clearHelloTimeout: Function;
        _connect: Function;
        _doFastConnectIdentify: Function;
        _doIdentify: Function;
        _doResume: Function;
        _doResumeOrIdentify: Function;
        _getConnectionPath: Function;
        _getGatewayUrl: Function;
        _handleClose: Function;
        _handleDispatch: Function;
        _handleDispatchWithoutQueueing: Function;
        _handleGenericDispatch: Function;
        _handleHeartbeatAck: Function;
        _handleHeartbeatTimeout: Function;
        _handleHello: Function;
        _handleInvalidSession: Function;
        _handleReady: Function;
        _handleReconnect: Function;
        _reset: Function;
        _sendHeartbeat: Function;
        _startHeartbeater: Function;
        _stopHeartbeater: Function;
        _updateLastHeartbeatAckTime: Function;
    }
    export interface GatewayConnectionStore extends Store {
        getSocket: () => Socket;
        initialize: Function;
        isConnected: Function;
        isConnectedOrOverlay: Function;
        isTryingToConnect: Function;
        lastTimeConnectedChanged: Function;
    }
    export interface PlatformWebsocket {
        browser: string;
        os: string;
    }
    export interface IdentityProps {
        capabilities: number;
        client_state: object;
        compress: boolean;
        presence: object;
        properties: object;
        token: string;
    }
    export interface Modules {
        loadModules?: () => Promise<void>;
        PlatformCheckUtils?: PlatformCheckUtils;

        GatewayConnectionStore?: GatewayConnectionStore;
    }
    export interface Settings {
        UI: string;
        WebSocket: string;
    }
}
export default Types;

declare global {
    export const DiscordNative: {
        accessibility: {
            isAccessibilitySupportEnabled: Function;
        };
        app: {
            dock: {
                setBadge: Function;
                bounce: Function;
                cancelBounce: Function;
            };
            getBuildNumber: Function;
            getDefaultDoubleClickAction: Function;
            getModuleVersions: Function;
            getPath: Function;
            getReleaseChannel: Function;
            getVersion: Function;
            registerUserInteractionHandler: Function;
            relaunch: Function;
            setBadgeCount: Function;
        };
        clipboard: {
            copy: Function;
            copyImage: Function;
            cut: Function;
            paste: Function;
            read: Function;
        };
        clips: {
            deleteClip: Function;
            loadClip: Function;
            loadClipsDirectory: Function;
        };
        crashReporter: {
            getMetadata: Function;
            updateCrashReporter: Function;
        };
        desktopCapture: {
            getDesktopCaptureSources: Function;
        };
        features: {
            declareSupported: Function;
            supports: Function;
        };
        fileManager: {
            basename: Function;
            cleanupTempFiles: Function;
            dirname: Function;
            extname: Function;
            getModuleDataPathSync: Function;
            getModulePath: Function;
            join: Function;
            openFiles: Function;
            readLogFiles: Function;
            readTimeSeriesLogFiles: Function;
            saveWithDialog: Function;
            showItemInFolder: Function;
            showOpenDialog: Function;
        };
        gpuSettings: {
            getEnableHardwareAcceleration: Function;
            setEnableHardwareAcceleration: Function;
        };
        http: {
            getAPIEndpoint: Function;
            makeChunkedRequest: Function;
        };
        ipc: {
            invoke: Function;
            on: Function;
            send: Function;
        };
        isRenderer: boolean;
        nativeModules: {
            canBootstrapNewUpdater: boolean;
            ensureModule: Function;
            requireModule: Function;
        };
        os: {
            arch: string;
            release: string;
        };
        powerMonitor: {
            getSystemIdleTimeMs: Function;
            on: Function;
            removeAllListeners: Function;
            removeListener: Function;
        };
        powerSaveBlocker: {
            blockDisplaySleep: Function;
            cleanupDisplaySleep: Function;
            unblockDisplaySleep: Function;
        };
        process: {
            arch: string;
            env: object;
            platform: string;
        };
        processUtils: {
            flushCookies: Function;
            flushDNSCache: Function;
            flushStorageData: Function;
            getCPUCoreCount: Function;
            getCurrentCPUUsagePercent: Function;
            getCurrentMemoryUsageKB: Function;
            getLastCrash: Function;
            getMainArgvSync: Function;
            purgeMemory: Function;
        };
        remoteApp: {
            dock: {
                setBadge: Function;
                bounce: Function;
                cancelBounce: Function;
            };
            getBuildNumber: Function;
            getDefaultDoubleClickAction: Function;
            getModuleVersions: Function;
            getPath: Function;
            getReleaseChannel: Function;
            getVersion: Function;
            registerUserInteractionHandler: Function;
            relaunch: Function;
            setBadgeCount: Function;
        };
        remotePowerMonitor: {
            getSystemIdleTimeMs: Function;
            on: Function;
            removeAllListeners: Function;
            removeListener: Function;
        };
        safeStorage: {
            decryptString: Function;
            encryptString: Function;
            isEncryptionAvailable: Function;
        };
        setUncaughtExceptionHandler: Function;
        settings: {
            get: Function;
            getSync: Function;
            set: Function;
        };
        spellCheck: {
            getAvailableDictionaries: Function;
            on: Function;
            removeListener: Function;
            replaceMisspelling: Function;
            setLearnedWords: Function;
            setLocale: Function;
        };
        thumbar: { setThumbarButtons: Function };
        userDataCache: {
            cacheUserData: Function;
            deleteCache: Function;
            getCached: Function;
        };
        window: {
            USE_OSX_NATIVE_TRAFFIC_LIGHTS: boolean;
            blur: Function;
            close: Function;
            flashFrame: Function;
            focus: Function;
            fullscreen: Function;
            isAlwaysOnTop: Function;
            maximize: Function;
            minimize: Function;
            restore: Function;
            setAlwaysOnTop: Function;
            setBackgroundThrottling: Function;
            setDevtoolsCallbacks: Function;
            setProgressBar: Function;
            setZoomFactor: Function;
        };
    };
}

export const defaultSettings = {
    UI: window.DiscordNative.process.platform,
    WebSocket: window.DiscordNative.process.platform,
};

export enum GatewayRequestTypes {
    DISPATCH = 0,
    HEARTBEAT,
    IDENTIFY,
    PRESENCE_UPDATE,
    VOICE_STATE_UPDATE,
    VOICE_SERVER_PING,
    RESUME,
    RECONNECT,
    REQUEST_GUILD_MEMBERS,
    INVALID_SESSION,
    HELLO,
    HEARTBEAT_ACK,
    CALL_CONNECT,
    GUILD_SUBSCRIPTIONS,
    LOBBY_CONNECT,
    LOBBY_DISCONNECT,
    LOBBY_VOICE_STATES_UPDATE,
    STREAM_CREATE,
    STREAM_DELETE,
    STREAM_WATCH,
    STREAM_PING,
    STREAM_SET_PAUSED,
    REQUEST_GUILD_APPLICATION_COMMANDS,
    EMBEDDED_ACTIVITY_LAUNCH,
    EMBEDDED_ACTIVITY_CLOSE,
    EMBEDDED_ACTIVITY_UPDATE,
    REQUEST_FORUM_UNREADS,
    REMOTE_COMMAND,
    GET_DELETED_ENTITY_IDS_NOT_MATCHING_HASH,
    REQUEST_SOUNDBOARD_SOUNDS,
    SPEED_TEST_CREATE,
    SPEED_TEST_DELETE,
    REQUEST_LAST_MESSAGES,
}