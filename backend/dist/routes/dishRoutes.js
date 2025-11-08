import express from 'express';
import { getAllDishes, createDish, deleteDish } from '../controllers/dishController.js';
const router = express.Router();
router.get('/', getAllDishes);
router.post('/', createDish);
router.delete('/', deleteDish);
export default router;
//# sourceMappingURL=dishRoutes.js.map