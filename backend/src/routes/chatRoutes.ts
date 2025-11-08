// routes/chat.routes.ts
import { Router } from 'express';
import * as chatController from "../controllers/chatController.js";

const chatRoutes = Router();

// Get all chat sessions for a user
chatRoutes.get('/sessions', chatController.getAllSessions);

// Get a specific session with all messages
chatRoutes.get('/sessions/:sessionId', chatController.getChatBySessionId);

// Create a new chat session
chatRoutes.post('/sessions', chatController.createChatSession);

// Delete a chat session (cascade deletes messages)
chatRoutes.delete('/sessions/:sessionId', chatController.deleteChatSession);

// Send a message and stream AI response (SSE)
chatRoutes.post('/message/stream', chatController.streamMessage);

export default chatRoutes;