export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface DietaryConsultantOptions {
    userMessage: string;
    conversationHistory?: ChatMessage[];
    healthConditions?: string[];
}
/**
 * Stream a conversational response (for real-time chat UI)
 */
export declare function streamDietaryConsultation(options: DietaryConsultantOptions): AsyncGenerator<string, void, unknown>;
//# sourceMappingURL=dietaryChat.d.ts.map