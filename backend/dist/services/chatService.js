import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Gets all chat sessions for a user
export async function getAllChatSessions(userId) {
    return await prisma.chatSession.findMany({
        where: { userId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
                take: 1, // Just get first message for preview
            },
        },
        orderBy: { updatedAt: 'desc' },
    });
}
;
// Gets a specific chat given the session id
export async function getChatBySessionId(sessionId) {
    return await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
    });
}
// Get conversation history
export async function getChatHistory(sessionId) {
    return await prisma.chatMessage.findMany({
        where: { sessionId: sessionId },
        orderBy: { createdAt: 'asc' },
        take: 20, // Last 20 messages for context
    });
}
// Creates a new chat session
export async function createChatSession(userId, title) {
    return await prisma.chatSession.create({
        data: {
            userId: parseInt(userId),
            title: title || 'New Conversation',
        },
    });
}
// Deletes a session given sessionId
export async function deleteChatSession(sessionId) {
    await prisma.chatSession.delete({
        where: { id: sessionId },
    });
}
// Creates new message for a chat session
export async function createChatMessage(sessionId, message, role) {
    return await prisma.chatMessage.create({
        data: {
            sessionId: sessionId,
            role,
            content: message.trim(),
        },
    });
}
// Updates the session timestamp
export async function updateSessionTimestamp(sessionId) {
    await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
    });
}
//# sourceMappingURL=chatService.js.map