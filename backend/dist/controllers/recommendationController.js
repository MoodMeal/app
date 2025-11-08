import * as dishService from "../services/recommendationService.js";
import { generateDishRecommendation } from "../utils/openai.js";
//Generate AI recommendations AND save to a chat session
export async function recommendDish(req, res) {
    try {
        const { sessionId, message } = req.body;
        if (!sessionId || !message)
            return res.status(400).json({ error: "sessionId and message are required" });
        const recommendations = await generateDishRecommendation(message);
        if (!recommendations)
            return res.status(500).json({ error: "Failed to generate recommendations" });
        const savedDishes = await dishService.saveDishesToSession(sessionId, recommendations.dishes.map(d => ({
            name: d.dishName,
            cuisine: d.cuisine ?? null,
            country: d.country ?? null,
            description: d.description ?? null,
            reasoning: d.reasoning ?? null,
            imageUrl: d.imageUrl ?? null
        })));
        return res.json({ success: true, data: savedDishes });
    }
    catch (err) {
        console.error("❌ Error generating aligned dish recommendations:", err);
        return res.status(500).json({ success: false, error: err.message || "Failed to generate aligned dish recommendations" });
    }
}
//Get dishes for a chat session
export async function getDishesForSession(req, res) {
    try {
        const { sessionId } = req.params;
        if (!sessionId)
            return res.status(400).json({ error: "sessionId is required" });
        const dishes = await dishService.getDishesForSession(Number(sessionId));
        return res.json(dishes);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
//Delete a dish
export async function deleteDish(req, res) {
    try {
        const { dishId } = req.body;
        if (!dishId)
            return res.status(400).json({ error: "dishId is required" });
        const deleted = await dishService.deleteDish(Number(dishId));
        return res.json({ success: true, data: deleted });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=recommendationController.js.map