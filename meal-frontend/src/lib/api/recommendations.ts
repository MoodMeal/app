import { fetcher } from '../utils/fetcher';

export const RecommendationsAPI = {
    getQuickDishSuggestion: (prompt: string) =>
        fetcher('/recommendations/suggestion', {
            method: 'POST',
            body: JSON.stringify({ prompt }),
        }),
    bySession: (id: number) =>
        fetcher(`/recommendations/session/${id}`),

    create: (body: any) =>
        fetcher(`/recommendations`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    delete: (dishId: number) =>
        fetcher(`/recommendations/delete`, {
            method: 'DELETE',
            body: JSON.stringify({ dishId }),
        }),
};
