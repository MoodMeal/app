export declare function getAllChatSessions(userId: any): Promise<({
    messages: {
        id: number;
        createdAt: Date;
        sessionId: number;
        role: string;
        content: string;
    }[];
} & {
    id: number;
    userId: number;
    title: string;
    updatedAt: Date;
})[]>;
export declare function getChatBySessionId(sessionId: any): Promise<({
    messages: {
        id: number;
        createdAt: Date;
        sessionId: number;
        role: string;
        content: string;
    }[];
} & {
    id: number;
    userId: number;
    title: string;
    updatedAt: Date;
}) | null>;
export declare function getChatHistory(sessionId: any): Promise<{
    id: number;
    createdAt: Date;
    sessionId: number;
    role: string;
    content: string;
}[]>;
export declare function createChatSession(userId: any, title: any): Promise<{
    id: number;
    userId: number;
    title: string;
    updatedAt: Date;
}>;
export declare function deleteChatSession(sessionId: any): Promise<void>;
export declare function createChatMessage(sessionId: any, message: any, role: string): Promise<{
    id: number;
    createdAt: Date;
    sessionId: number;
    role: string;
    content: string;
}>;
export declare function updateSessionTimestamp(sessionId: any): Promise<void>;
//# sourceMappingURL=chatService.d.ts.map