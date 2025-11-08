import { z } from 'zod';
export declare const DishRecommendationSchema: z.ZodObject<{
    dishes: z.ZodArray<z.ZodObject<{
        dishName: z.ZodString;
        cuisine: z.ZodString;
        country: z.ZodString;
        description: z.ZodString;
        imageUrl: z.ZodOptional<z.ZodString>;
        reasoning: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type DishRecommendation = z.infer<typeof DishRecommendationSchema>;
export declare function generateDishRecommendation(prompt: string): Promise<DishRecommendation | null>;
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
 * Generate a short, AI-generated title for a chat session
 */
export declare function generateSessionTitle(userMessage: string, healthConditions?: string[]): Promise<string>;
export declare function generateRandomUserPrompts(): Promise<string[]>;
/**
 * Stream a conversational response (for real-time chat UI)
 */
export declare function streamDietaryConsultation(options: DietaryConsultantOptions): AsyncGenerator<string, void, unknown>;
//# sourceMappingURL=openai.d.ts.map