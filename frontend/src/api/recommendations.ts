import { api } from './client';

interface Dish {
    id: number;
    name: string;
    cuisine?: string;
    country?: string;
    description?: string;
    imageUrl?: string;
}

export interface Recommendation {
    aiRecommendation?: Recommendation;
    id: number;
    userId: number;
    prompt: string;
    dishId: number | null;
    dishName?: string | null;
    cuisine?: string | null;
    country?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    dish?: Dish;
    reasoning?: string;
}

export const recommendationsApi = {
    create: (data: { userId: number; prompt: string, save: boolean }) =>
        api.post<Recommendation>("/recommendations", data),
    // Add this so DishDetail can fetch recommendations:
    getByUser: (userId: number) =>
        api.get<Recommendation[]>(`/recommendations/user/${userId}`),
    getByDish: (dishId: number) => // Add this!
        api.get<Recommendation[]>(`/recommendations/dish/${dishId}`),
};
