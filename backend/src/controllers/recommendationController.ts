import type { Request, Response } from "express";
import * as dishService from "../services/recommendationService.js";
import { generateDishRecommendation, generateQuickSuggestions } from "../utils/openai/index.js";


//Generate AI recommendations AND save to a chat session
export async function recommendDish(req: Request, res: Response) {
    try {
        const { sessionId, message } = req.body;
        if (!sessionId || !message) return res.status(400).json({ error: "sessionId and message are required" });

        const recommendations = await generateDishRecommendation(message);
        if (!recommendations) return res.status(500).json({ error: "Failed to generate recommendations" });

        const savedDishes = await dishService.saveDishesToSession(sessionId, recommendations.dishes.map(d => ({
            name: d.dishName,
            cuisine: d.cuisine ?? null,
            country: d.country ?? null,
            description: d.description ?? null,
            reasoning: d.reasoning ?? null,
            imageUrl: d.imageUrl ?? null
        })));

        return res.json({ success: true, data: savedDishes });
    } catch (err: any) {
        console.error("❌ Error generating aligned dish recommendations:", err);
        return res.status(500).json({ success: false, error: err.message || "Failed to generate aligned dish recommendations" });
    }
}


//Get dishes for a chat session
export async function getDishesForSession(req: Request, res: Response) {
    try {
        const { sessionId } = req.params;
        if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

        const dishes = await dishService.getDishesForSession(Number(sessionId));
        return res.json(dishes);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}


//Delete a dish
export async function deleteDish(req: Request, res: Response) {
    try {
        const { dishId } = req.body;
        if (!dishId) return res.status(400).json({ error: "dishId is required" });

        const deleted = await dishService.deleteDish(Number(dishId));
        return res.json({ success: true, data: deleted });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}

export async function getQuickDishSuggestion(req: Request, res: Response) {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
        return res.status(400).json({ error: "prompt is required and must be a non-empty string" });
    }

    try {
        const suggestions = await generateQuickSuggestions(prompt.trim());
        return res.json({ success: true, data: suggestions });
    } catch (err: any) {
        console.error("Error generating quick suggestions:", err);
        return res.status(500).json({ error: "Failed to generate suggestions" });
    }
}
