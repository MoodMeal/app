import express from "express";
import * as recommendationController from "../controllers/recommendationController.js";
const recommendationRoutes = express.Router();
// Creates JSON list of recommended dishes based on users input
recommendationRoutes.post("/", recommendationController.recommendDish);
// Gets a list of recommendations for each chat session
recommendationRoutes.get("/session/:sessionId", recommendationController.getDishesForSession);
// Deletes a recommendation
recommendationRoutes.delete("/delete", recommendationController.deleteDish);
export default recommendationRoutes;
//# sourceMappingURL=recommendationRoutes.js.map