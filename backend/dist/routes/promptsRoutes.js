import { Router } from "express";
import { getSuggestedPrompts } from "../controllers/promptsController.js";
const promptsRoutes = Router();
// Get suggestions from AI for user to ask
promptsRoutes.get('/suggest', getSuggestedPrompts);
export default promptsRoutes;
//# sourceMappingURL=promptsRoutes.js.map