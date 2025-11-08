export interface RecommendedDish {
    id?: number;
    name: string;
    cuisine?: string | null;
    country?: string | null;
    description?: string | null;
    reasoning?: string | null;
    imageUrl?: string | null;
}
export declare function generateRecommendation(prompt: string): Promise<RecommendedDish[]>;
export declare function saveDishesToSession(sessionId: number, dishes: RecommendedDish[]): Promise<{
    id: number;
    updatedAt: Date;
    createdAt: Date;
    sessionId: number;
    name: string;
    cuisine: string | null;
    country: string | null;
    description: string | null;
    imageUrl: string | null;
    reasoning: string | null;
}[]>;
export declare function getDishesForSession(sessionId: number): Promise<{
    id: number;
    name: string;
    cuisine: string | null;
    country: string | null;
    description: string | null;
    reasoning: string | null;
}[]>;
export declare function deleteDish(dishId: number): Promise<{
    id: number;
    updatedAt: Date;
    createdAt: Date;
    sessionId: number;
    name: string;
    cuisine: string | null;
    country: string | null;
    description: string | null;
    imageUrl: string | null;
    reasoning: string | null;
}>;
//# sourceMappingURL=recommendationService.d.ts.map