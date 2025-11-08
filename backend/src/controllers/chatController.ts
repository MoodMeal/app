import type { Request, Response } from 'express';
import * as chatService from '../services/chatService.js';
import { streamDietaryConsultation, generateSessionTitle } from '../utils/openai.js';

interface SessionParams {
    sessionId: string;
}

// Get all chat sessions for a user
export const getAllSessions = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.query.userId as string);

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: 'Valid userId is required' });
        }

        const sessions = await chatService.getAllChatSessions(userId);

        res.json({ data: sessions });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
}

// Get a specific session with all messages
export const getChatBySessionId = async (req: Request<SessionParams>, res: Response) => {
    try {
        const sessionId = parseInt(req.params.sessionId);

        if (!sessionId || isNaN(sessionId)) {
            return res.status(400).json({ error: 'Valid sessionId is required' });
        }

        const session = await chatService.getChatBySessionId(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ data: session });
    } catch (error) {
        console.error('Error fetching chat session:', error);
        res.status(500).json({ error: 'Failed to fetch chat session' });
    }
}

// Create a new chat session
export const createChatSession = async (req: Request, res: Response) => {
    try {
        const { userId, title, firstMessage } = req.body;

        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({ error: 'Valid userId is required' });
        }

        let sessionTitle = title;
        if (!sessionTitle) {
            if (firstMessage && firstMessage.trim().length > 0) {
                sessionTitle = await generateSessionTitle(firstMessage);
            } else {
                sessionTitle = 'New Session';
            }
        }

        const session = await chatService.createChatSession(userId, sessionTitle);

        res.json({ data: session });
    } catch (error) {
        console.error('Error creating chat session:', error);
        res.status(500).json({ error: 'Failed to create chat session' });
    }
};

// Deletes a chat session
export const deleteChatSession = async (req: Request<SessionParams>, res: Response) => {
    try {
        const sessionId = parseInt(req.params.sessionId);

        if (!sessionId || isNaN(sessionId)) {
            return res.status(400).json({ error: 'Valid sessionId is required' });
        }

        await chatService.deleteChatSession(sessionId);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat session:', error);
        res.status(500).json({ error: 'Failed to delete chat session' });
    }
}

// Send a message and stream AI response (SSE)
export const streamMessage = async (req: Request, res: Response) => {
    try {
        const { sessionId, userId, message, healthConditions } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Valid message is required' });
        }

        let actualSessionId = sessionId ? parseInt(sessionId) : null;

        // Create new session if none provided
        if (!actualSessionId) {
            if (!userId || isNaN(parseInt(userId))) {
                return res.status(400).json({ error: 'userId required for new session' });
            }
            const title = await generateSessionTitle(message);
            const newSession = await chatService.createChatSession(userId, title);
            actualSessionId = newSession.id;
        }

        // Save user message
        await chatService.createChatMessage(actualSessionId, message, 'user');

        // Get conversation history
        const previousMessages = await chatService.getChatHistory(actualSessionId);

        const conversationHistory = previousMessages
            .slice(0, -1)
            .map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            }));

        // Set up SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send session ID first
        res.write(`data: ${JSON.stringify({ type: 'session', sessionId: actualSessionId })}\n\n`);

        let fullResponse = '';

        // Stream AI response
        const stream = streamDietaryConsultation({
            userMessage: message.trim(),
            conversationHistory,
            healthConditions: healthConditions || [],
        });

        for await (const chunk of stream) {
            fullResponse += chunk;
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        }

        // Save complete AI response
        const assistantMessage = await chatService.createChatMessage(actualSessionId, fullResponse, 'assistant');

        // Update session timestamp
        await chatService.updateSessionTimestamp(actualSessionId);

        // Send completion event
        res.write(
            `data: ${JSON.stringify({
                type: 'done',
                messageId: assistantMessage.id,
            })}\n\n`
        );
        res.end();
    } catch (error) {
        console.error('Error streaming chat message:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to process message' })}\n\n`);
        res.end();
    }
}