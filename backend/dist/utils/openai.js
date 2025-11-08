import { config } from "../config.js";
import OpenAI from 'openai';
import { z } from 'zod';
import { PROMPTS } from '../prompts/prompts.js';
if (!config.openaiKey)
    throw new Error("OPENAI_API_KEY is missing");
const openai = new OpenAI({ apiKey: config.openaiKey });
// ============================================
// EXISTING: Structured Dish Recommendation
// ============================================
export const DishRecommendationSchema = z.object({
    dishes: z.array(z.object({
        dishName: z.string().min(1, 'Dish name cannot be empty'),
        cuisine: z.string().min(1, 'Cuisine cannot be empty'),
        country: z.string().min(1, 'Country cannot be empty'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        imageUrl: z.string().url().optional(),
        reasoning: z.string().min(20, 'Reasoning must be at least 20 characters'),
    })).min(3, 'Must provide at least 3 dish recommendations')
});
export async function generateDishRecommendation(prompt) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        console.error('Invalid prompt: Prompt must be a non-empty string');
        return null;
    }
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-2024-08-06',
            messages: [
                {
                    role: 'system',
                    content: PROMPTS.dishRecommendations.system,
                },
                { role: 'user', content: prompt.trim() },
            ],
            response_format: { type: 'json_object' },
        });
        const raw = response.choices[0]?.message?.content;
        console.log('🧠 Raw AI response:', raw);
        if (!raw)
            return null;
        try {
            const parsed = DishRecommendationSchema.parse(JSON.parse(raw));
            return parsed;
        }
        catch (err) {
            console.error('Invalid AI output:', raw);
            return null;
        }
    }
    catch (err) {
        console.error('Error generating dish recommendation:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            prompt,
        });
        return null;
    }
}
/**
 * Generate a short, AI-generated title for a chat session
 */
export async function generateSessionTitle(userMessage, healthConditions = []) {
    if (!userMessage || userMessage.trim().length === 0) {
        return 'New Session';
    }
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'system',
                    content: PROMPTS.sessionTitle.system(healthConditions)
                },
                {
                    role: 'user',
                    content: `Create a short title for this chat session based on the user's message: "${userMessage.trim()}"`
                }
            ],
            max_tokens: 15,
            temperature: 0.5
        });
        const title = response.choices[0]?.message?.content?.trim();
        return title || 'New Session';
    }
    catch (err) {
        console.error('Error generating session title:', err instanceof Error ? err.message : err);
        return 'New Session';
    }
}
export async function generateRandomUserPrompts() {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: PROMPTS.randomUserPrompts.system,
                },
                {
                    role: 'user',
                    content: 'Generate random short dietary question examples as a JSON array of strings.',
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.9,
        });
        const raw = response.choices[0]?.message?.content;
        if (!raw)
            throw new Error('Empty AI response');
        const parsed = JSON.parse(raw);
        // ✅ handle both direct array or object with .questions
        const prompts = Array.isArray(parsed)
            ? parsed
            : parsed.questions || parsed.prompts || [];
        if (!Array.isArray(prompts) || prompts.length === 0) {
            throw new Error('AI response is not a valid array');
        }
        return prompts;
    }
    catch (err) {
        console.error('🔥 Error generating random prompts:', {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
        });
        return [
            'What foods help reduce stress?',
            'Can I eat eggs daily?',
            'Best dinner ideas for diabetics?',
            'What’s a healthy snack for ulcers?',
            'Is oatmeal good for weight loss?',
        ];
    }
}
/**
 * Stream a conversational response (for real-time chat UI)
 */
export async function* streamDietaryConsultation(options) {
    const { userMessage, conversationHistory = [], healthConditions = [] } = options;
    if (!userMessage || userMessage.trim().length === 0) {
        console.error('Invalid message: Message must be a non-empty string');
        return;
    }
    try {
        const systemPrompt = PROMPTS.dietaryConsultant.system(healthConditions);
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userMessage.trim() },
        ];
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-2024-08-06',
            messages: messages,
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
    }
    catch (err) {
        console.error('Error streaming dietary consultation:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            userMessage,
        });
    }
}
//# sourceMappingURL=openai.js.map