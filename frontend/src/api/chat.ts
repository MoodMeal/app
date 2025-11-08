// src/api/chatApi.ts
import { api } from './client';

export interface ChatMessage {
    id: number;
    sessionId: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export interface ChatSession {
    id: number;
    userId: number;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages?: ChatMessage[];
}

export const chatApi = {
    // Get all sessions for a user
    getSessions: (userId: number) =>
        api.get<{ data: ChatSession[] }>('/chat/sessions', {
            params: { userId },
        }),

    // Get a specific session with messages
    getSession: (sessionId: number) =>
        api.get<{ data: ChatSession }>(`/chat/sessions/${sessionId}`),

    // Create a new session
    createSession: (userId: number, title?: string) =>
        api.post<{ data: ChatSession }>('/chat/sessions', {
            userId,
            title: title || 'New Conversation',
        }),

    // Delete a session
    deleteSession: (sessionId: number) =>
        api.delete<{ success: boolean }>(`/chat/sessions/${sessionId}`),

    // Send a message (non-streaming)
    sendMessage: (data: {
        sessionId?: number;
        userId: number;
        message: string;
        healthConditions?: string[];
    }) =>
        api.post<{
            data: {
                sessionId: number;
                userMessage: ChatMessage;
                assistantMessage: ChatMessage;
            };
        }>('/chat/message', data),

    // Stream endpoint URL (still for fetch API, no change needed)
    getStreamUrl: () => '/chat/message/stream',
};
