import { openai } from "./client.js";
import { z } from 'zod';
import { PROMPTS } from '../../prompts/prompts.js';

export const DishRecommendationSchema = z.object({
    dishes: z.array(
        z.object({
            dishName: z.string().min(1, 'Dish name cannot be empty'),
            cuisine: z.string().min(1, 'Cuisine cannot be empty'),
            country: z.string().min(1, 'Country cannot be empty'),
            description: z.string().min(10, 'Description must be at least 10 characters'),
            imageUrl: z.string().url().optional(),
            reasoning: z.string().min(20, 'Reasoning must be at least 20 characters'),
        })
    ).min(3, 'Must provide at least 3 dish recommendations')
});
export type DishRecommendation = z.infer<typeof DishRecommendationSchema>;

export async function generateDishRecommendation(
    prompt: string
): Promise<DishRecommendation | null> {
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
        if (!raw) return null;

        try {
            const parsed = DishRecommendationSchema.parse(JSON.parse(raw));
            return parsed;
        } catch (err) {
            console.error('Invalid AI output:', raw);
            return null;
        }
    } catch (err) {
        console.error('Error generating dish recommendation:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            prompt,
        });
        return null;
    }
}

export const QuickDishSuggestionSchema = z.object({
    suggestions: z.array(z.object({
        name: z.string(),
        description: z.string(),
    })).min(3).max(5)
});
export type QuickDishSuggestion = z.infer<typeof QuickDishSuggestionSchema>;

export async function generateQuickSuggestions(prompt: string): Promise<QuickDishSuggestion | null> {
    if (!prompt) return null;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: "You are a friendly AI food assistant. Provide 3-5 short dish suggestions based on the user's input. No long explanations."
                },
                {
                    role: 'user',
                    content: `
                        Suggest 3-5 quick dishes based on this input: "${prompt}".
                        Respond **only in JSON** like this:
                        {
                          "suggestions": [
                            { "name": "Dish 1", "description": "Short description" },
                            { "name": "Dish 2", "description": "Short description" }
                          ]
                        }
                    `
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
        });

        // Log the raw API response
        console.log("🟢 Raw OpenAI response:", response);

        const rawContent = response.choices[0]?.message?.content;
        console.log("🟡 Raw message content:", rawContent);

        if (!rawContent) return null;

        try {
            const parsed = QuickDishSuggestionSchema.parse(JSON.parse(rawContent));
            console.log("🟣 Parsed suggestions object:", parsed);
            return parsed;
        } catch (err) {
            console.error("🔴 Failed to parse AI JSON:", rawContent, err);
            return null;
        }

    } catch (err) {
        console.error("🔴 Error generating quick suggestions:", err);
        return null;
    }
}


