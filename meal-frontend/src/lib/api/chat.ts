import { fetcher } from '../utils/fetcher';

export const ChatAPI = {
    getSessions: (userId: number) =>
        fetcher<{ data: any[] }>(`/chat/sessions?userId=${userId}`),

    getSession: (sessionId: number) =>
        fetcher<{ data: any }>(`/chat/sessions/${sessionId}`),

    deleteSession: (sessionId: number) =>
        fetcher(`/chat/sessions/${sessionId}`, { method: 'DELETE' }),

    sendMessageStream: (payload: any) =>
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/message/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }), // stream must be handled manually
};
