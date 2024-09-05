export interface Activity {
    created_at: string | Date;
    emoji?: {
        name: string;
    };
    id: string;
    name: string;
    state: string;
    type: number;
}

export interface UserSession {
    id_hash: string;
    approx_last_used_time: string;
    client_info: ClientInfo;
}

export interface UserSessions {
    user_sessions: UserSession[];
}

export interface ClientInfo {
    client: string;
    os: string;
    version: number;
    location?: string;
}

export interface Session {
    sessionId: string;
    status: string;
    activities: Activity[];
    active: boolean;
    clientInfo: ClientInfo;
    [key: string]: any;
}

export interface SessionsReplace {
    type: string;
    sessions: Session[];
    [key: string]: any;
}