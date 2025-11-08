import { api } from './client';

export interface Dish {
    id: number;
    name: string;
    cuisine: string | null;
    country: string | null;
    description: string | null;
    imageUrl: string | null;
}

export const dishesApi = {
    getAll: () => api.get<Dish[]>('/dishes'),
    create: (dish: Omit<Dish, 'id'>) => api.post<Dish>('/dishes', dish),
    delete: (dishId: number) => api.delete('/dishes', { data: { dishId } }),
};
