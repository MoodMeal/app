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
export declare const QuickDishSuggestionSchema: z.ZodObject<{
    suggestions: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type QuickDishSuggestion = z.infer<typeof QuickDishSuggestionSchema>;
export declare function generateQuickSuggestions(prompt: string): Promise<QuickDishSuggestion | null>;
//# sourceMappingURL=dishRecommendation.d.ts.map