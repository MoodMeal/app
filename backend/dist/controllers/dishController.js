import { z } from "zod";
import * as dishService from "../services/dishService.js";
const createDishSchema = z.object({
    name: z.string().min(1),
    cuisine: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
});
export async function getAllDishes(req, res) {
    try {
        const dishes = await dishService.getAllDishes();
        res.status(200).json(dishes);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: message });
    }
}
export async function createDish(req, res) {
    try {
        const parsed = createDishSchema.parse(req.body);
        const dish = await dishService.createDish({
            name: parsed.name,
            cuisine: parsed.cuisine ?? null,
            country: parsed.country ?? null,
            description: parsed.description ?? null,
            imageUrl: parsed.imageUrl ?? null,
        });
        res.status(201).json(dish);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: "Invalid input", details: err.issues });
            return;
        }
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: message });
    }
}
export async function deleteDish(req, res) {
    try {
        const { dishId } = req.body;
        if (!dishId) {
            res.status(400).json({ error: "dishId is required" });
            return;
        }
        await dishService.deleteDish(dishId);
        res.status(200).json({ message: "Dish and its recommendations deleted successfully" });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: message });
    }
}
//# sourceMappingURL=dishController.js.map