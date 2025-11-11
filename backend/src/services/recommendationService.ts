import { PrismaClient } from "@prisma/client";
import { generateDishRecommendation } from "../utils/openai/index.js";

const prisma = new PrismaClient();

export interface RecommendedDish {
    id?: number;
    name: string;
    cuisine?: string | null;
    country?: string | null;
    description?: string | null;
    reasoning?: string | null;
    imageUrl?: string | null;
}


// Generate AI dish recommendations
export async function generateRecommendation(prompt: string): Promise<RecommendedDish[]> {
    const aiResponse = await generateDishRecommendation(prompt);
    if (!aiResponse?.dishes) return [];

    return aiResponse.dishes.map(dish => ({
        name: dish.dishName ?? "Unnamed Dish",
        cuisine: dish.cuisine ?? null,
        country: dish.country ?? null,
        description: dish.description ?? null,
        reasoning: dish.reasoning ?? "AI recommends this dish.",
        imageUrl: dish.imageUrl?.startsWith("https://")
            ? dish.imageUrl
            : "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80"
    }));
}

//Save dishes directly to a ChatSession
export async function saveDishesToSession(sessionId: number, dishes: RecommendedDish[]) {
    if (!dishes || dishes.length === 0) return [];

    const savedDishes = [];

    for (const dish of dishes) {
        const saved = await prisma.dish.create({
            data: {
                sessionId,
                name: dish.name,
                cuisine: dish.cuisine ?? null,
                country: dish.country ?? null,
                description: dish.description ?? null,
                reasoning: dish.reasoning ?? null,
                imageUrl: dish.imageUrl ?? null,
            }
        });
        savedDishes.push(saved);
    }

    return savedDishes;
}


//Get dishes for a session
export async function getDishesForSession(sessionId: number) {
    return await prisma.dish.findMany({
        where: { sessionId },
        select: {
            id: true,
            name: true,
            description: true,
            cuisine: true,
            country: true,
            reasoning: true,
        },
        orderBy: { createdAt: 'asc' }
    });
}


//Delete a dish
export async function deleteDish(dishId: number) {
    return prisma.dish.delete({ where: { id: dishId } });
}
