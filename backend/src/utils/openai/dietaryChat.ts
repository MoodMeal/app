import { openai } from "./client.js";
import { PROMPTS } from '../../prompts/prompts.js';


export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface DietaryConsultantOptions {
    userMessage: string;
    conversationHistory?: ChatMessage[];
    healthConditions?: string[]; // optional: known user health conditions
}

/**
 * Stream a conversational response (for real-time chat UI)
 */
export async function* streamDietaryConsultation(
    options: DietaryConsultantOptions
): AsyncGenerator<string, void, unknown> {
    const { userMessage, conversationHistory = [], healthConditions = [] } = options;

    if (!userMessage || userMessage.trim().length === 0) {
        console.error('Invalid message: Message must be a non-empty string');
        return;
    }

    try {
        const systemPrompt = PROMPTS.dietaryConsultant.system(healthConditions);

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userMessage.trim() },
        ];

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-2024-08-06',
            messages: messages as any,
            temperature: 0.7,
            max_tokens: 800,
            stream: true,
        });
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    } catch (err) {
        console.error('Error streaming dietary consultation:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            userMessage,
        });
    }
}